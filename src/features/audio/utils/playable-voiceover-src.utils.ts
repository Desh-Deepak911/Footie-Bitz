import type { FootieScript } from "@/features/story/types";

import {
  readVoiceoverAudioBase64,
  resolveCanonicalVoiceoverFromUrlFields,
  resolveVoiceoverSourceFromUrlFields,
  type VoiceoverSource,
} from "./canonical-voiceover.utils";

export type PlayableVoiceoverSrcKind =
  | "blob"
  | "data-url"
  | "object-url"
  | "https"
  | "missing";

export interface PlayableVoiceoverDiagnostics {
  canonicalVoiceoverSource: VoiceoverSource;
  playableVoiceoverSrcKind: PlayableVoiceoverSrcKind;
  mimeType?: string;
  hasBase64: boolean;
}

export interface PlayableVoiceoverResolution extends PlayableVoiceoverDiagnostics {
  src?: string;
  hasPlayableSrc: boolean;
  durationMs?: number;
}

export const VOICEOVER_UNPLAYABLE_MESSAGE =
  "Voiceover exists but could not be loaded. Regenerate or upload audio.";

function normalizeMimeType(value: string | undefined | null): string {
  const trimmed = value?.split(";")[0]?.trim().toLowerCase();
  return trimmed || "audio/mpeg";
}

function decodeBase64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64.trim());
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function looksLikeRawBase64(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 16) {
    return false;
  }

  if (trimmed.includes("://") || /\s/.test(trimmed)) {
    return false;
  }

  return /^[A-Za-z0-9+/]+=*$/.test(trimmed);
}

function parseDataUrlPayload(
  dataUrl: string,
): { mimeType: string; base64Payload?: string; bytes?: Uint8Array } | null {
  const match = dataUrl.trim().match(/^data:([^,]*?),([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const metadata = match[1] ?? "";
  const payload = match[2] ?? "";
  const mimeType = normalizeMimeType(metadata.split(";")[0] || undefined);
  const isBase64 = metadata.includes(";base64");

  if (isBase64) {
    if (!payload.trim()) {
      return null;
    }

    try {
      return { mimeType, base64Payload: payload.trim(), bytes: decodeBase64ToBytes(payload) };
    } catch {
      return null;
    }
  }

  try {
    const bytes = Uint8Array.from(decodeURIComponent(payload), (char) => char.charCodeAt(0));
    return bytes.length > 0 ? { mimeType, bytes } : null;
  } catch {
    return null;
  }
}

/** Infers MIME type from audio magic bytes — defaults to MP3 for TTS output. */
export function inferVoiceoverMimeTypeFromBytes(bytes: Uint8Array): string {
  if (bytes.length >= 12) {
    const riff = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!);
    const wave = String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!);
    if (riff === "RIFF" && wave === "WAVE") {
      return "audio/wav";
    }
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "audio/webm";
  }

  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return "audio/mpeg";
  }

  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0) {
    return "audio/mpeg";
  }

  return "audio/mpeg";
}

function classifySrcKind(src: string | undefined): PlayableVoiceoverSrcKind {
  const trimmed = src?.trim();
  if (!trimmed) {
    return "missing";
  }

  if (trimmed.startsWith("blob:")) {
    return "object-url";
  }

  if (trimmed.startsWith("data:")) {
    return "data-url";
  }

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return "https";
  }

  return "missing";
}

function createDataUrlFromBytes(bytes: Uint8Array, mimeType: string): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

function createObjectUrlFromBytes(bytes: Uint8Array, mimeType: string): string {
  return URL.createObjectURL(new Blob([Uint8Array.from(bytes)], { type: mimeType }));
}

/**
 * Materializes a browser-playable voiceover src from persisted base64 or data URL text.
 * Does not double-prefix data URLs. Raw base64 becomes a typed data URL or object URL.
 */
export function materializePlayableVoiceoverFromBase64(
  payload: string,
  options?: { preferObjectUrl?: boolean },
): { src: string; mimeType: string; kind: PlayableVoiceoverSrcKind } | null {
  const trimmed = payload.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("data:")) {
    const parsed = parseDataUrlPayload(trimmed);
    if (!parsed?.bytes?.length) {
      return null;
    }

    return {
      src: trimmed,
      mimeType: parsed.mimeType,
      kind: "data-url",
    };
  }

  let bytes: Uint8Array;
  try {
    bytes = looksLikeRawBase64(trimmed) ? decodeBase64ToBytes(trimmed) : decodeBase64ToBytes(trimmed);
  } catch {
    return null;
  }

  if (bytes.length === 0) {
    return null;
  }

  const mimeType = inferVoiceoverMimeTypeFromBytes(bytes);

  if (options?.preferObjectUrl) {
    return {
      src: createObjectUrlFromBytes(bytes, mimeType),
      mimeType,
      kind: "object-url",
    };
  }

  return {
    src: createDataUrlFromBytes(bytes, mimeType),
    mimeType,
    kind: "data-url",
  };
}

function resolveDurationMs(story: FootieScript | null | undefined): number | undefined {
  const durationMs = story?.voiceoverDurationMs;
  if (typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs > 0) {
    return Math.round(durationMs);
  }
  return undefined;
}

function missingResolution(
  story: FootieScript | null | undefined,
): PlayableVoiceoverResolution {
  return {
    src: undefined,
    hasPlayableSrc: false,
    canonicalVoiceoverSource: story
      ? resolveVoiceoverSourceFromUrlFields(story)
      : "none",
    playableVoiceoverSrcKind: "missing",
    mimeType: undefined,
    hasBase64: Boolean(story && readVoiceoverAudioBase64(story)),
    durationMs: resolveDurationMs(story),
  };
}

/**
 * Resolves a validated playable voiceover src for preview playback.
 * Prefers persisted base64 over stale blob URLs; falls back to live URL when base64 cannot decode.
 */
export function resolvePlayableVoiceoverFromStory(
  story: FootieScript | null | undefined,
  options?: { preferObjectUrl?: boolean },
): PlayableVoiceoverResolution {
  if (!story) {
    return missingResolution(story);
  }

  const canonicalVoiceoverSource = resolveVoiceoverSourceFromUrlFields(story);
  const base64 = readVoiceoverAudioBase64(story);
  const fromUrl = resolveCanonicalVoiceoverFromUrlFields(story);
  const durationMs = fromUrl?.durationMs ?? resolveDurationMs(story);

  if (base64) {
    const materialized = materializePlayableVoiceoverFromBase64(base64, options);
    if (materialized) {
      return {
        src: materialized.src,
        hasPlayableSrc: true,
        canonicalVoiceoverSource,
        playableVoiceoverSrcKind: materialized.kind,
        mimeType: materialized.mimeType,
        hasBase64: true,
        durationMs,
      };
    }
  }

  const url = fromUrl?.url?.trim();
  if (url) {
    const kind = classifySrcKind(url);
    if (kind !== "missing") {
      return {
        src: url,
        hasPlayableSrc: true,
        canonicalVoiceoverSource,
        playableVoiceoverSrcKind: kind === "object-url" ? "object-url" : kind,
        mimeType: kind === "data-url" ? parseDataUrlPayload(url)?.mimeType : undefined,
        hasBase64: Boolean(base64),
        durationMs,
      };
    }
  }

  return {
    ...missingResolution(story),
    durationMs,
  };
}

export function hasPlayableVoiceoverSource(story: FootieScript | null | undefined): boolean {
  return resolvePlayableVoiceoverFromStory(story).hasPlayableSrc;
}
