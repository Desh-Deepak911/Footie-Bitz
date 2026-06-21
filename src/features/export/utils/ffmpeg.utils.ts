const FFMPEG_CORE_VERSION = "0.12.6";
const FFMPEG_CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

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

function formatFfmpegDuration(seconds: number): string {
  return Math.max(0.001, seconds).toFixed(3);
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
  const [{ fetchFile }, ffmpeg] = await Promise.all([
    import("@ffmpeg/util"),
    getFFmpeg(),
  ]);

  const duration = formatFfmpegDuration(options.videoDurationSec);

  await ffmpeg.writeFile(VIDEO_INPUT, await fetchFile(videoBlob));
  await ffmpeg.writeFile(AUDIO_INPUT, await fetchFile(audioBlob));

  const handleProgress = ({ progress }: { progress: number; time?: number }) => {
    if (!options.onProgress) return;
    const normalized = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
    options.onProgress(Math.round(normalized * 100));
  };

  ffmpeg.on("progress", handleProgress);

  try {
    const exitCode = await ffmpeg.exec([
      "-i",
      VIDEO_INPUT,
      "-i",
      AUDIO_INPUT,
      "-filter_complex",
      `[1:a]atrim=0:${duration},apad=whole_dur=${duration}[aout]`,
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
    await cleanupFFmpegFiles(ffmpeg, [VIDEO_INPUT, AUDIO_INPUT, MUXED_OUTPUT]);
  }
}
