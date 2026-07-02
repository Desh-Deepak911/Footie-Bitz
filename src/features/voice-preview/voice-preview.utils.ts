import {
  resolveExpressiveDelivery,
  resolveSpeechStylePreset,
} from "@/features/speech-style";
import {
  resolveVoiceoverSpeed,
  resolveVoiceoverVoice,
} from "@/lib/utils/voiceoverOptions";

import type { ParsedVoicePreviewRequest, VoicePreviewRequestBody } from "./voice-preview.types";

export const DEFAULT_VOICE_PREVIEW_SAMPLE_TEXT =
  "This is how your story could sound in this voice.";

export const MAX_VOICE_PREVIEW_SAMPLE_LENGTH = 180;

export const VOICE_PREVIEW_CACHE_TTL_MS = 30 * 60 * 1000;

/** Returns default or caller-provided preview sample text, clamped to max length. */
export function resolveVoicePreviewSampleText(sampleText?: string): string {
  const trimmed = sampleText?.trim();
  if (!trimmed) {
    return DEFAULT_VOICE_PREVIEW_SAMPLE_TEXT;
  }

  return trimmed.slice(0, MAX_VOICE_PREVIEW_SAMPLE_LENGTH);
}

/** Stable cache key for preview audio — voice + speed + sample text + style. */
export function buildVoicePreviewCacheKey(
  voice: string,
  speed: number,
  sampleText: string,
  stylePreset: string,
  expressiveDelivery: boolean,
): string {
  return `${voice}|${speed}|${stylePreset}|${expressiveDelivery ? "1" : "0"}|${sampleText}`;
}

export function parseVoicePreviewRequest(
  body: VoicePreviewRequestBody,
):
  | { ok: true; value: ParsedVoicePreviewRequest }
  | { ok: false; error: string } {
  if (typeof body.voice !== "string" || !body.voice.trim()) {
    return { ok: false, error: "Voice is required" };
  }

  const voice = resolveVoiceoverVoice(body.voice);
  const speed = resolveVoiceoverSpeed(body.speed);
  const stylePreset = resolveSpeechStylePreset(body.stylePreset);
  const expressiveDelivery = resolveExpressiveDelivery(
    stylePreset,
    body.expressiveDelivery,
  );
  const sampleText = resolveVoicePreviewSampleText(
    typeof body.sampleText === "string" ? body.sampleText : undefined,
  );

  return {
    ok: true,
    value: {
      voice,
      sampleText,
      speed,
      stylePreset,
      expressiveDelivery,
    },
  };
}
