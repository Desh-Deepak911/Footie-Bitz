import type { CaptionMode, FootieScene, SubtitleEffect } from "@/types/footiebitz";

export const DEFAULT_CAPTION_MODE: CaptionMode = "generated";
export const DEFAULT_SUBTITLE_EFFECT: SubtitleEffect = "fade-up";

export const CAPTION_MODE_OPTIONS: { value: CaptionMode; label: string }[] = [
  { value: "generated", label: "Generated" },
  { value: "subtitles", label: "Subtitles" },
];

export const SUBTITLE_EFFECT_OPTIONS: { value: SubtitleEffect; label: string }[] = [
  { value: "fade-up", label: "Fade up" },
  { value: "typewriter", label: "Typewriter" },
  { value: "highlight", label: "Highlight" },
];

const CAPTION_MODES = new Set<CaptionMode>(CAPTION_MODE_OPTIONS.map((o) => o.value));
const SUBTITLE_EFFECTS = new Set<SubtitleEffect>(
  SUBTITLE_EFFECT_OPTIONS.map((o) => o.value),
);

export function isCaptionMode(value: string): value is CaptionMode {
  return CAPTION_MODES.has(value as CaptionMode);
}

export function isSubtitleEffect(value: string): value is SubtitleEffect {
  return SUBTITLE_EFFECTS.has(value as SubtitleEffect);
}

export function normalizeCaptionMode(value: unknown): CaptionMode {
  if (value == null || value === "") {
    return DEFAULT_CAPTION_MODE;
  }

  if (typeof value === "string" && isCaptionMode(value)) {
    return value;
  }

  return DEFAULT_CAPTION_MODE;
}

export function normalizeSubtitleEffect(value: unknown): SubtitleEffect {
  if (value == null || value === "") {
    return DEFAULT_SUBTITLE_EFFECT;
  }

  if (typeof value === "string" && isSubtitleEffect(value)) {
    return value;
  }

  return DEFAULT_SUBTITLE_EFFECT;
}

/** Applies default caption mode and subtitle effect to a scene (legacy-safe). */
export function normalizeSceneCaptionSettings(scene: FootieScene): FootieScene {
  return {
    ...scene,
    captionMode: normalizeCaptionMode(scene.captionMode),
    subtitleEffect: normalizeSubtitleEffect(scene.subtitleEffect),
  };
}

export function normalizeScenesCaptionSettings(scenes: FootieScene[]): FootieScene[] {
  return scenes.map(normalizeSceneCaptionSettings);
}

/**
 * Forces AI-generated story scenes to use generated captions with the default effect.
 * Ignores any captionMode/subtitleEffect the model may return.
 */
export function applyGeneratedStorySceneCaptions(scenes: FootieScene[]): FootieScene[] {
  return scenes.map((scene) => ({
    ...scene,
    captionMode: DEFAULT_CAPTION_MODE,
    subtitleEffect: DEFAULT_SUBTITLE_EFFECT,
  }));
}

export function getCaptionModeLabel(mode: CaptionMode): string {
  return CAPTION_MODE_OPTIONS.find((option) => option.value === mode)?.label ?? "Generated";
}

export function getSubtitleEffectLabel(effect: SubtitleEffect): string {
  return SUBTITLE_EFFECT_OPTIONS.find((option) => option.value === effect)?.label ?? "Fade up";
}
