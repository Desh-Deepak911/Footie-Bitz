import type { AudioFirstGenerationResult, FootieScript } from "@/features/story/types";

export type Tone = "dramatic" | "funny" | "tactical" | "news" | "emotional";

export type QualityMode = "cheap" | "balanced" | "best";

export const MIN_SCENE_COUNT = 3;
export const MAX_SCENE_COUNT = 12;
export const DEFAULT_SCENE_COUNT = 6;

export function resolveSceneCount(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SCENE_COUNT;
  }
  return Math.max(MIN_SCENE_COUNT, Math.min(MAX_SCENE_COUNT, Math.round(parsed)));
}

export interface GenerateScriptRequest {
  topic: string;
  tone: Tone;
  duration: number;
  qualityMode?: QualityMode;
  sceneCount?: number;
  /** When true, responds with NDJSON progress events followed by a complete payload. */
  stream?: boolean;
}

export const GENERATION_LOADING_STEPS = [
  "Writing narration...",
  "Generating voiceover...",
  "Planning scenes...",
  "Building storyboard...",
] as const;

export type GenerationLoadingStep = 1 | 2 | 3 | 4;

export type GenerateScriptProgressEvent = {
  type: "progress";
  step: GenerationLoadingStep;
  label: (typeof GENERATION_LOADING_STEPS)[number];
};

export type GenerateScriptStreamCompleteEvent = GenerateScriptResponse & {
  type: "complete";
  usedFallback?: boolean;
};

export type GenerateScriptStreamErrorEvent = {
  type: "error";
  error: string;
};

export type GenerateScriptStreamEvent =
  | GenerateScriptProgressEvent
  | GenerateScriptStreamCompleteEvent
  | GenerateScriptStreamErrorEvent;

export interface GenerateScriptResponse {
  success: boolean;
  data?: FootieScript;
  /** Structured audio-first pipeline output when available. */
  audioFirst?: AudioFirstGenerationResult;
  /** Base64-encoded MP3 when the audio-first pipeline succeeds. */
  voiceoverAudioBase64?: string;
  /** True when scene timings were fitted to measured voiceover duration. */
  audioFirstApplied?: boolean;
  error?: string;
}
