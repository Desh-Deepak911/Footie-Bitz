import type { VoicePreviewCacheEntry } from "./voice-preview.types";
import { VOICE_PREVIEW_CACHE_TTL_MS } from "./voice-preview.utils";

const cache = new Map<string, VoicePreviewCacheEntry>();

function cloneBuffer(buffer: ArrayBuffer): ArrayBuffer {
  return buffer.slice(0);
}

/** Reads cached preview audio when present and not expired. */
export function readVoicePreviewCache(cacheKey: string): ArrayBuffer | null {
  const entry = cache.get(cacheKey);
  if (!entry) {
    return null;
  }

  if (Date.parse(entry.expiresAt) <= Date.now()) {
    cache.delete(cacheKey);
    return null;
  }

  return cloneBuffer(entry.audioBuffer);
}

/** Writes preview audio to the in-memory server cache. */
export function writeVoicePreviewCache(input: {
  cacheKey: string;
  audioBuffer: ArrayBuffer;
  ttlMs?: number;
}): VoicePreviewCacheEntry {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + (input.ttlMs ?? VOICE_PREVIEW_CACHE_TTL_MS),
  ).toISOString();

  const entry: VoicePreviewCacheEntry = {
    cacheKey: input.cacheKey,
    createdAt,
    expiresAt,
    audioBuffer: cloneBuffer(input.audioBuffer),
  };

  cache.set(input.cacheKey, entry);
  return {
    ...entry,
    audioBuffer: cloneBuffer(entry.audioBuffer),
  };
}

/** Clears all preview cache entries — verification helper only. */
export function resetVoicePreviewCacheForTests(): void {
  cache.clear();
}

/** Returns current cache size — verification helper only. */
export function getVoicePreviewCacheSizeForTests(): number {
  return cache.size;
}

/** Returns generation call count from cache metadata — verification helper only. */
export function getVoicePreviewCacheKeysForTests(): string[] {
  return [...cache.keys()];
}
