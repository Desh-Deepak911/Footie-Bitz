const FFMPEG_CORE_VERSION = "0.12.6";
const FFMPEG_CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

import type { ExportBackgroundMusicMixSettings } from "./export-background-music.utils";
import {
  buildExportBackgroundMusicFilterChain,
  resolveBackgroundMusicInputFilename,
} from "./export-background-music.utils";

/** Browser-only FFmpeg.wasm helpers. Import dynamically from client export code. */
type FFmpegInstance = import("@ffmpeg/ffmpeg").FFmpeg;

let ffmpegInstance: FFmpegInstance | null = null;
let loadPromise: Promise<FFmpegInstance> | null = null;

export function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined";
}

export function isFFmpegLoaded(): boolean {
  return ffmpegInstance?.loaded ?? false;
}

/**
 * Returns a singleton FFmpeg.wasm instance loaded in the browser.
 * Safe to import from client components; throws if called during SSR.
 */
export async function getFFmpeg(): Promise<FFmpegInstance> {
  if (!isBrowserEnvironment()) {
    throw new Error("FFmpeg is only available in the browser");
  }

  if (ffmpegInstance?.loaded) {
    return ffmpegInstance;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = loadFFmpegInternal();

  try {
    return await loadPromise;
  } catch (error) {
    loadPromise = null;
    throw error;
  }
}

async function loadFFmpegInternal(): Promise<FFmpegInstance> {
  const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
    import("@ffmpeg/ffmpeg"),
    import("@ffmpeg/util"),
  ]);

  const ffmpeg = new FFmpeg();

  await ffmpeg.load({
    coreURL: await toBlobURL(
      `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
      "text/javascript",
    ),
    wasmURL: await toBlobURL(
      `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
      "application/wasm",
    ),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

const VIDEO_INPUT = "video.webm";
const AUDIO_INPUT = "audio.mp3";
const MUXED_OUTPUT = "output.webm";

async function cleanupFFmpegFiles(
  ffmpeg: FFmpegInstance,
  files: string[],
): Promise<void> {
  await Promise.all(
    files.map(async (file) => {
      try {
        await ffmpeg.deleteFile(file);
      } catch {
        // Ignore missing virtual files.
      }
    }),
  );
}

export interface MuxVideoWithAudioOptions {
  /** Target output duration in seconds (matches rendered video length). */
  videoDurationSec: number;
  /** FFmpeg mux progress from 0–100, when available. */
  onProgress?: (progress: number) => void;
}

export interface MuxVideoWithExportAudioOptions extends MuxVideoWithAudioOptions {
  voiceoverBlob?: Blob;
  backgroundMusicBlob?: Blob;
  backgroundMusicFileName?: string;
  backgroundMusicMix?: ExportBackgroundMusicMixSettings;
}

function formatFfmpegDuration(seconds: number): string {
  return Math.max(0.001, seconds).toFixed(3);
}

function buildVoiceFilterChain(inputIndex: number, durationSec: number, outputLabel: string): string {
  const duration = formatFfmpegDuration(durationSec);
  return `[${inputIndex}:a]atrim=0:${duration},apad=whole_dur=${duration},volume=1[${outputLabel}]`;
}

/**
 * Muxes a silent WebM video with optional narration and background music.
 * Voiceover stays full level; music is mixed underneath with volume, fades, and ducking applied
 * before the mix step.
 */
export async function muxVideoWithExportAudio(
  videoBlob: Blob,
  options: MuxVideoWithExportAudioOptions,
): Promise<Blob> {
  const [{ fetchFile }, ffmpeg] = await Promise.all([
    import("@ffmpeg/util"),
    getFFmpeg(),
  ]);

  const durationSec = options.videoDurationSec;
  const duration = formatFfmpegDuration(durationSec);
  const hasVoiceover = Boolean(options.voiceoverBlob);
  const hasMusic = Boolean(options.backgroundMusicBlob && options.backgroundMusicMix);

  if (!hasVoiceover && !hasMusic) {
    throw new Error("Export audio mux requires voiceover or background music");
  }

  const writtenFiles = [VIDEO_INPUT, MUXED_OUTPUT];
  await ffmpeg.writeFile(VIDEO_INPUT, await fetchFile(videoBlob));

  const execArgs: string[] = ["-i", VIDEO_INPUT];
  let voiceInputIndex: number | null = null;
  let musicInputIndex: number | null = null;
  let nextInputIndex = 1;

  if (hasVoiceover && options.voiceoverBlob) {
    await ffmpeg.writeFile(AUDIO_INPUT, await fetchFile(options.voiceoverBlob));
    writtenFiles.push(AUDIO_INPUT);
    execArgs.push("-i", AUDIO_INPUT);
    voiceInputIndex = nextInputIndex;
    nextInputIndex += 1;
  }

  let musicInputFilename: string | null = null;
  if (hasMusic && options.backgroundMusicBlob && options.backgroundMusicMix) {
    musicInputFilename = resolveBackgroundMusicInputFilename(
      options.backgroundMusicBlob,
      options.backgroundMusicFileName,
    );
    await ffmpeg.writeFile(musicInputFilename, await fetchFile(options.backgroundMusicBlob));
    writtenFiles.push(musicInputFilename);
    execArgs.push("-stream_loop", "-1", "-i", musicInputFilename);
    musicInputIndex = nextInputIndex;
    nextInputIndex += 1;
  }

  let filterComplex = "";
  if (hasVoiceover && hasMusic && voiceInputIndex != null && musicInputIndex != null) {
    filterComplex = [
      buildExportBackgroundMusicFilterChain(
        musicInputIndex,
        durationSec,
        options.backgroundMusicMix!,
        "music",
      ),
      buildVoiceFilterChain(voiceInputIndex, durationSec, "voice"),
      "[music][voice]amix=inputs=2:duration=first:dropout_transition=0[aout]",
    ].join(";");
  } else if (hasMusic && musicInputIndex != null && options.backgroundMusicMix) {
    filterComplex = buildExportBackgroundMusicFilterChain(
      musicInputIndex,
      durationSec,
      options.backgroundMusicMix,
      "aout",
    );
  } else if (hasVoiceover && voiceInputIndex != null) {
    filterComplex = `[${voiceInputIndex}:a]atrim=0:${duration},apad=whole_dur=${duration}[aout]`;
  }

  const handleProgress = ({ progress }: { progress: number; time?: number }) => {
    if (!options.onProgress) return;
    const normalized = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
    options.onProgress(Math.round(normalized * 100));
  };

  ffmpeg.on("progress", handleProgress);

  try {
    const exitCode = await ffmpeg.exec([
      ...execArgs,
      "-filter_complex",
      filterComplex,
      "-map",
      "0:v:0",
      "-map",
      "[aout]",
      "-c:v",
      "copy",
      "-c:a",
      "libopus",
      "-t",
      duration,
      MUXED_OUTPUT,
    ]);

    if (exitCode !== 0) {
      throw new Error("FFmpeg failed to combine video and audio");
    }

    const data = await ffmpeg.readFile(MUXED_OUTPUT);
    if (typeof data === "string") {
      throw new Error("Unexpected text output from FFmpeg");
    }

    options.onProgress?.(100);

    return new Blob([new Uint8Array(data)], { type: "video/webm" });
  } finally {
    ffmpeg.off("progress", handleProgress);
    await cleanupFFmpegFiles(ffmpeg, writtenFiles);
  }
}

/**
 * Muxes a silent WebM video with an MP3 narration track in the browser.
 * Output length follows the video: shorter audio is padded with silence,
 * longer audio is trimmed to the video duration.
 */
export async function muxVideoWithAudio(
  videoBlob: Blob,
  audioBlob: Blob,
  options: MuxVideoWithAudioOptions,
): Promise<Blob> {
  return muxVideoWithExportAudio(videoBlob, {
    ...options,
    voiceoverBlob: audioBlob,
  });
}

const TRANSCODE_INPUT = "transcode-input.webm";
const TRANSCODE_OUTPUT = "transcode-output.mp4";

export interface TranscodeWebmToMp4Options {
  /** Whether the input includes an audio track to preserve. */
  hasAudio?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Converts a WebM export blob to MP4 (H.264 + AAC when audio is present).
 * Used when exportSettings.format is mp4 — canvas capture still records WebM internally.
 */
export async function transcodeWebmToMp4(
  videoBlob: Blob,
  options: TranscodeWebmToMp4Options = {},
): Promise<Blob> {
  const [{ fetchFile }, ffmpeg] = await Promise.all([
    import("@ffmpeg/util"),
    getFFmpeg(),
  ]);

  await ffmpeg.writeFile(TRANSCODE_INPUT, await fetchFile(videoBlob));

  const handleProgress = ({ progress }: { progress: number; time?: number }) => {
    if (!options.onProgress) return;
    const normalized = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
    options.onProgress(Math.round(normalized * 100));
  };

  ffmpeg.on("progress", handleProgress);

  const args = options.hasAudio
    ? [
        "-i",
        TRANSCODE_INPUT,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        TRANSCODE_OUTPUT,
      ]
    : [
        "-i",
        TRANSCODE_INPUT,
        "-map",
        "0:v:0",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "23",
        "-an",
        "-movflags",
        "+faststart",
        TRANSCODE_OUTPUT,
      ];

  try {
    const exitCode = await ffmpeg.exec(args);

    if (exitCode !== 0) {
      throw new Error("FFmpeg failed to convert video to MP4");
    }

    const data = await ffmpeg.readFile(TRANSCODE_OUTPUT);
    if (typeof data === "string") {
      throw new Error("Unexpected text output from FFmpeg");
    }

    options.onProgress?.(100);

    return new Blob([new Uint8Array(data)], { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", handleProgress);
    await cleanupFFmpegFiles(ffmpeg, [TRANSCODE_INPUT, TRANSCODE_OUTPUT]);
  }
}
