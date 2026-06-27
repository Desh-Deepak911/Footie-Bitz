import type { AudioMix } from "@/features/audio";
import type { StoryBackgroundMusic } from "@/features/story/types";
import { getStoryBackgroundMusic } from "@/features/story/utils";
import {
  PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC,
  PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC,
  resolvePreviewBackgroundMusicUrl,
} from "@/features/preview/utils";

/** Attempt browser export mixing when background music is enabled. */
export const EXPORT_BACKGROUND_MUSIC_MIXING_ENABLED = true;

export const EXPORT_BACKGROUND_MUSIC_FALLBACK_WARNING =
  "Background music plays in preview but wasn't included in this WebM file. Try MP4 or turn off background music.";

/** @deprecated Use EXPORT_AUDIO_VOICE_ONLY_FALLBACK_MESSAGE */
export const EXPORT_BACKGROUND_MUSIC_PARTIAL_FALLBACK_WARNING =
  "Exported with narration only because background music could not be merged.";

export const EXPORT_AUDIO_FULL_SUCCESS_MESSAGE =
  "Your video is ready with narration and background music.";

export const EXPORT_AUDIO_VOICE_ONLY_FALLBACK_MESSAGE =
  "Exported with narration only because background music could not be merged.";

/** User-facing warning when export falls back to voiceover-only after music merge failure. */
export const EXPORT_AUDIO_VOICE_ONLY_FALLBACK_WARNING =
  EXPORT_AUDIO_VOICE_ONLY_FALLBACK_MESSAGE;

export const EXPORT_AUDIO_SILENT_FALLBACK_MESSAGE =
  "Exported without audio. Something went wrong while adding sound to your video.";

export interface ExportBackgroundMusicMixSettings {
  /** Normalized export timeline length from prepareStoryForExport. */
  exportDurationMs: number;
  volume: number;
  fadeIn: boolean;
  fadeOut: boolean;
  fadeInSec: number;
  fadeOutSec: number;
}

/** Converts preflight export duration to seconds for FFmpeg/browser mix. */
export function resolveExportBackgroundMusicDurationSec(exportDurationMs: number): number {
  return Math.max(0.001, exportDurationMs / 1000);
}

export function isExportBackgroundMusicActive(
  script: Parameters<typeof getStoryBackgroundMusic>[0],
): boolean {
  return Boolean(resolvePreviewBackgroundMusicUrl(script));
}

/** True when the normalized audio mix includes playable background music. */
export function isExportBackgroundMusicActiveFromMix(audioMix: AudioMix): boolean {
  return Boolean(audioMix.background?.src && audioMix.background.enabled);
}

export function resolveExportBackgroundMusicBedVolume(
  music: StoryBackgroundMusic,
): number {
  return Math.min(1, Math.max(0, music.volume));
}

function resolveExportBackgroundMusicBedVolumeFromMix(
  audioMix: AudioMix,
): number {
  const background = audioMix.background;
  if (!background) {
    return 0;
  }

  return Math.min(1, Math.max(0, background.volume));
}

export function resolveExportBackgroundMusicMixSettings(
  script: Parameters<typeof getStoryBackgroundMusic>[0],
  _includeNarration: boolean,
  exportDurationMs: number,
): ExportBackgroundMusicMixSettings | null {
  const music = getStoryBackgroundMusic(script);
  if (!music.enabled || !resolvePreviewBackgroundMusicUrl(script)) {
    return null;
  }

  return {
    exportDurationMs: Math.max(0, Math.round(exportDurationMs)),
    volume: resolveExportBackgroundMusicBedVolume(music),
    fadeIn: music.fadeIn,
    fadeOut: music.fadeOut,
    fadeInSec: PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC,
    fadeOutSec: PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC,
  };
}

/** Builds FFmpeg mix settings from a normalized story audio mix. */
export function resolveExportBackgroundMusicMixSettingsFromMix(
  audioMix: AudioMix,
  _includeNarration: boolean,
  exportDurationMs: number,
): ExportBackgroundMusicMixSettings | null {
  if (!isExportBackgroundMusicActiveFromMix(audioMix)) {
    return null;
  }

  return {
    exportDurationMs: Math.max(0, Math.round(exportDurationMs)),
    volume: resolveExportBackgroundMusicBedVolumeFromMix(audioMix),
    fadeIn: audioMix.fadeIn,
    fadeOut: audioMix.fadeOut,
    fadeInSec: PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC,
    fadeOutSec: PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC,
  };
}

/** Normalizes export audio streams to a common sample rate/layout before amix. */
export const EXPORT_FFMPEG_AUDIO_FORMAT_FILTERS = [
  "aresample=48000",
  "aformat=sample_fmts=fltp:channel_layouts=stereo",
] as const;

export function buildExportBackgroundMusicFilterChain(
  inputIndex: number,
  settings: ExportBackgroundMusicMixSettings,
  outputLabel: string,
): string {
  const duration = resolveExportBackgroundMusicDurationSec(settings.exportDurationMs).toFixed(3);
  const filters = [
    ...EXPORT_FFMPEG_AUDIO_FORMAT_FILTERS,
    "aloop=loop=-1:size=2e+09",
    `atrim=0:${duration}`,
    "asetpts=PTS-STARTPTS",
    `volume=${settings.volume.toFixed(4)}`,
  ];

  return `[${inputIndex}:a]${filters.join(",")}[${outputLabel}]`;
}

export function resolveBackgroundMusicInputFilename(
  blob: Blob,
  fileName?: string,
): string {
  const namedExtension = fileName?.match(/(\.[a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (namedExtension && [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".webm"].includes(namedExtension)) {
    return `music${namedExtension}`;
  }

  if (blob.type.includes("wav")) return "music.wav";
  if (blob.type.includes("ogg")) return "music.ogg";
  if (blob.type.includes("mp4") || blob.type.includes("aac")) return "music.m4a";
  if (blob.type.includes("webm")) return "music.webm";

  return "music.mp3";
}
