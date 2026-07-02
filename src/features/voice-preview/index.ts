export type {
  GenerateVoicePreviewResult,
  ParsedVoicePreviewRequest,
  VoicePreviewRequestBody,
  VoicePreviewState,
} from "./voice-preview.types";

export {
  buildVoicePreviewCacheKey,
  DEFAULT_VOICE_PREVIEW_SAMPLE_TEXT,
  MAX_VOICE_PREVIEW_SAMPLE_LENGTH,
  parseVoicePreviewRequest,
  resolveVoicePreviewSampleText,
  VOICE_PREVIEW_CACHE_TTL_MS,
} from "./voice-preview.utils";

export { fetchVoicePreview } from "./voice-preview.client";
export type { FetchVoicePreviewParams } from "./voice-preview.client";

export {
  getActiveVoicePreviewVoiceId,
  stopVoicePreview,
  subscribeVoicePreviewPlayback,
} from "./voice-preview.playback";

export { useVoicePreview } from "./useVoicePreview";
export type { UseVoicePreviewOptions } from "./useVoicePreview";
