import type { VoiceoverSpeedOption } from "@/lib/utils/voiceoverOptions";
import type { SpeechStylePreset } from "@/features/speech-style";

export type VoicePreviewState = "idle" | "loading" | "playing" | "error";

export interface VoicePreviewRequestBody {
  voice?: unknown;
  sampleText?: unknown;
  speed?: unknown;
  stylePreset?: unknown;
  expressiveDelivery?: unknown;
}

export interface ParsedVoicePreviewRequest {
  voice: string;
  sampleText: string;
  speed: VoiceoverSpeedOption;
  stylePreset: SpeechStylePreset;
  expressiveDelivery: boolean;
}

export interface VoicePreviewCacheEntry {
  cacheKey: string;
  createdAt: string;
  expiresAt: string;
  audioBuffer: ArrayBuffer;
}

export interface GenerateVoicePreviewResult {
  audioBuffer: ArrayBuffer;
  cacheHit: boolean;
  voice: string;
  speed: VoiceoverSpeedOption;
  sampleText: string;
}
