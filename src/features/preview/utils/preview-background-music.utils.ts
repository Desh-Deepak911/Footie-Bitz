import type { FootieScript } from "@/features/story/types";
import { getStoryBackgroundMusic } from "@/features/story/utils";

export const PREVIEW_MUSIC_DUCKING_MULTIPLIER = 0.35;
export const PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC = 2;
export const PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC = 2;

export function resolvePreviewBackgroundMusicUrl(
  script: FootieScript | null | undefined,
): string | null {
  if (!script) {
    return null;
  }

  const music = getStoryBackgroundMusic(script);
  if (!music.enabled || music.source === "none") {
    return null;
  }

  const fileUrl = music.fileUrl?.trim();
  return fileUrl || null;
}

export function isPreviewBackgroundMusicActive(
  script: FootieScript | null | undefined,
): boolean {
  return Boolean(resolvePreviewBackgroundMusicUrl(script));
}

export function computePreviewBackgroundMusicFadeMultiplier(
  elapsedSec: number,
  totalDurationSec: number,
  fadeIn: boolean,
  fadeOut: boolean,
): number {
  let multiplier = 1;

  if (fadeIn && PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC > 0) {
    multiplier *= Math.min(1, Math.max(0, elapsedSec / PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC));
  }

  if (fadeOut && totalDurationSec > 0 && PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC > 0) {
    const remainingSec = totalDurationSec - elapsedSec;
    multiplier *= Math.min(1, Math.max(0, remainingSec / PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC));
  }

  return multiplier;
}

export function computePreviewBackgroundMusicVolume(options: {
  baseVolume: number;
  duckingEnabled: boolean;
  voiceoverIsPlaying: boolean;
  fadeMultiplier: number;
}): number {
  const { baseVolume, duckingEnabled, voiceoverIsPlaying, fadeMultiplier } = options;
  let volume = baseVolume;

  if (duckingEnabled && voiceoverIsPlaying) {
    volume *= PREVIEW_MUSIC_DUCKING_MULTIPLIER;
  }

  return Math.min(1, Math.max(0, volume * fadeMultiplier));
}

export function resolvePreviewBackgroundMusicPlaybackVolume(options: {
  script: FootieScript | null | undefined;
  elapsedSec: number;
  totalDurationSec: number;
  voiceoverIsPlaying: boolean;
}): number {
  const music = getStoryBackgroundMusic(options.script);
  if (!music.enabled) {
    return 0;
  }

  const fadeMultiplier = computePreviewBackgroundMusicFadeMultiplier(
    options.elapsedSec,
    options.totalDurationSec,
    music.fadeIn,
    music.fadeOut,
  );

  return computePreviewBackgroundMusicVolume({
    baseVolume: music.volume,
    duckingEnabled: music.duckingEnabled,
    voiceoverIsPlaying: options.voiceoverIsPlaying,
    fadeMultiplier,
  });
}
