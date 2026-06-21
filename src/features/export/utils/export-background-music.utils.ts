import type { StoryBackgroundMusic } from "@/features/story/types";
import { getStoryBackgroundMusic } from "@/features/story/utils";
import {
  PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC,
  PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC,
  PREVIEW_MUSIC_DUCKING_MULTIPLIER,
  resolvePreviewBackgroundMusicUrl,
} from "@/features/preview/utils";

/** Attempt browser export mixing when background music is enabled. */
export const EXPORT_BACKGROUND_MUSIC_MIXING_ENABLED = true;

export const EXPORT_BACKGROUND_MUSIC_FALLBACK_WARNING =
  "Background music plays in preview. This export was saved without music — export mixing is coming soon.";

export const EXPORT_BACKGROUND_MUSIC_PARTIAL_FALLBACK_WARNING =
  "Background music could not be mixed into this export. Voiceover was kept — try preview for music playback.";

export interface ExportBackgroundMusicMixSettings {
  volume: number;
  fadeIn: boolean;
  fadeOut: boolean;
  fadeInSec: number;
  fadeOutSec: number;
}

export function isExportBackgroundMusicActive(
  script: Parameters<typeof getStoryBackgroundMusic>[0],
): boolean {
  return Boolean(resolvePreviewBackgroundMusicUrl(script));
}

export function resolveExportBackgroundMusicBedVolume(
  music: StoryBackgroundMusic,
  includeNarration: boolean,
): number {
  let volume = music.volume;

  if (music.duckingEnabled && includeNarration) {
    volume *= PREVIEW_MUSIC_DUCKING_MULTIPLIER;
  }

  return Math.min(1, Math.max(0, volume));
}

export function resolveExportBackgroundMusicMixSettings(
  script: Parameters<typeof getStoryBackgroundMusic>[0],
  includeNarration: boolean,
): ExportBackgroundMusicMixSettings | null {
  const music = getStoryBackgroundMusic(script);
  if (!music.enabled || !resolvePreviewBackgroundMusicUrl(script)) {
    return null;
  }

  return {
    volume: resolveExportBackgroundMusicBedVolume(music, includeNarration),
    fadeIn: music.fadeIn,
    fadeOut: music.fadeOut,
    fadeInSec: PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC,
    fadeOutSec: PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC,
  };
}

export function buildExportBackgroundMusicFilterChain(
  inputIndex: number,
  durationSec: number,
  settings: ExportBackgroundMusicMixSettings,
  outputLabel: string,
): string {
  const duration = Math.max(0.001, durationSec).toFixed(3);
  const filters = [
    `atrim=0:${duration}`,
    `apad=whole_dur=${duration}`,
    `volume=${settings.volume.toFixed(4)}`,
  ];

  if (settings.fadeIn && settings.fadeInSec > 0) {
    filters.push(`afade=t=in:st=0:d=${settings.fadeInSec}`);
  }

  if (settings.fadeOut && settings.fadeOutSec > 0 && durationSec > settings.fadeOutSec) {
    const fadeOutStart = Math.max(0, durationSec - settings.fadeOutSec).toFixed(3);
    filters.push(`afade=t=out:st=${fadeOutStart}:d=${settings.fadeOutSec}`);
  }

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
