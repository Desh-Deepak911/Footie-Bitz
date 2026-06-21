import type { FootieScript, StoryBackgroundMusic } from "@/features/story/types";

export const DEFAULT_BACKGROUND_MUSIC_VOLUME = 0.18;

const BACKGROUND_MUSIC_SOURCES = ["none", "upload", "library"] as const;

function isBackgroundMusicSource(value: unknown): value is StoryBackgroundMusic["source"] {
  return (
    typeof value === "string" &&
    BACKGROUND_MUSIC_SOURCES.includes(value as StoryBackgroundMusic["source"])
  );
}

function clampBackgroundMusicVolume(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_BACKGROUND_MUSIC_VOLUME;
  }

  return Math.min(1, Math.max(0, parsed));
}

function optionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function resolveBackgroundMusicSource(
  enabled: boolean,
  source: unknown,
): StoryBackgroundMusic["source"] {
  if (!enabled) {
    return "none";
  }

  return isBackgroundMusicSource(source) && source !== "none" ? source : "none";
}

/** Normalizes story background music with safe defaults for legacy stories. */
export function normalizeStoryBackgroundMusic(
  partial?: Partial<StoryBackgroundMusic> | null,
): StoryBackgroundMusic {
  const enabled = partial?.enabled === true;
  const source = resolveBackgroundMusicSource(enabled, partial?.source);

  const normalized: StoryBackgroundMusic = {
    enabled,
    source,
    volume: clampBackgroundMusicVolume(partial?.volume),
    duckingEnabled: partial?.duckingEnabled !== false,
    fadeIn: partial?.fadeIn !== false,
    fadeOut: partial?.fadeOut !== false,
  };

  if (source === "upload") {
    const fileUrl = optionalTrimmedString(partial?.fileUrl);
    const fileName = optionalTrimmedString(partial?.fileName);
    const license = optionalTrimmedString(partial?.license);
    const attributionText = optionalTrimmedString(partial?.attributionText);

    if (fileUrl) normalized.fileUrl = fileUrl;
    if (fileName) normalized.fileName = fileName;
    if (license) normalized.license = license;
    if (partial?.attributionRequired != null) {
      normalized.attributionRequired = partial.attributionRequired;
    }
    if (attributionText) normalized.attributionText = attributionText;
  }

  if (source === "library") {
    const trackId = optionalTrimmedString(partial?.trackId);
    const trackName = optionalTrimmedString(partial?.trackName);
    const artist = optionalTrimmedString(partial?.artist);
    const fileUrl = optionalTrimmedString(partial?.fileUrl);
    const license = optionalTrimmedString(partial?.license);
    const attributionText = optionalTrimmedString(partial?.attributionText);

    if (trackId) normalized.trackId = trackId;
    if (trackName) normalized.trackName = trackName;
    if (artist) normalized.artist = artist;
    if (fileUrl) normalized.fileUrl = fileUrl;
    if (license) normalized.license = license;
    if (partial?.attributionRequired != null) {
      normalized.attributionRequired = partial.attributionRequired;
    }
    if (attributionText) normalized.attributionText = attributionText;
  }

  return normalized;
}

/** Returns normalized background music settings with defaults applied. */
export function getStoryBackgroundMusic(
  script: FootieScript | null | undefined,
): StoryBackgroundMusic {
  if (!script) {
    return normalizeStoryBackgroundMusic();
  }

  return normalizeStoryBackgroundMusic(script.backgroundMusic);
}

export function volumeToPercent(volume: number): number {
  return Math.round(clampBackgroundMusicVolume(volume) * 100);
}

export function percentToVolume(percent: number): number {
  if (!Number.isFinite(percent)) {
    return DEFAULT_BACKGROUND_MUSIC_VOLUME;
  }

  return clampBackgroundMusicVolume(percent / 100);
}

/** Updates story-level background music without touching voiceover or scenes. */
export function applyStoryBackgroundMusic(
  script: FootieScript,
  patch: Partial<StoryBackgroundMusic>,
): FootieScript {
  const current = getStoryBackgroundMusic(script);

  return {
    ...script,
    backgroundMusic: normalizeStoryBackgroundMusic({ ...current, ...patch }),
  };
}
