import type { CaptionPresetConfig, CaptionPresetId } from "./caption-engine.types";

export const CAPTION_PRESET_ORDER: readonly CaptionPresetId[] = [
  "minimal",
  "documentary",
  "tiktok",
  "sports",
  "news",
  "cinematic",
] as const;

const CAPTION_PRESET_DEFINITIONS: CaptionPresetConfig[] = [
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean fade-in captions with no emphasis — closest to legacy fade-up.",
    entranceEffect: "fade",
    emphasisBehavior: "none",
    motionIntensity: "low",
    textWeight: "normal",
    shadowStyle: "none",
    highlightStyle: "none",
    recommendedUse: ["general", "legacy fade-up", "low-distraction overlays"],
    fallbackSubtitleEffect: "fade-up",
  },
  {
    id: "documentary",
    label: "Documentary",
    description: "Measured fade entrance with subtle weight for long-form narration.",
    entranceEffect: "fade",
    emphasisBehavior: "none",
    motionIntensity: "low",
    textWeight: "semibold",
    shadowStyle: "subtle",
    highlightStyle: "none",
    recommendedUse: ["explainers", "analysis", "history", "legacy fade-up alternative"],
    fallbackSubtitleEffect: "fade-up",
  },
  {
    id: "tiktok",
    label: "TikTok",
    description: "Punchy pop entrance with high motion — maps from legacy typewriter pacing.",
    entranceEffect: "pop",
    emphasisBehavior: "none",
    motionIntensity: "high",
    textWeight: "bold",
    shadowStyle: "strong",
    highlightStyle: "none",
    recommendedUse: ["short-form", "hooks", "progressive reveal", "legacy typewriter"],
    fallbackSubtitleEffect: "typewriter",
  },
  {
    id: "sports",
    label: "Sports",
    description: "Bouncy entrance with glow emphasis for high-energy highlight moments.",
    entranceEffect: "bounce",
    emphasisBehavior: "glow",
    motionIntensity: "high",
    textWeight: "bold",
    shadowStyle: "strong",
    highlightStyle: "bar",
    recommendedUse: ["goals", "celebrations", "legacy highlight alternative"],
    fallbackSubtitleEffect: "highlight",
  },
  {
    id: "news",
    label: "News",
    description: "Slide-in captions with bar highlight for broadcast-style lower-thirds.",
    entranceEffect: "slide",
    emphasisBehavior: "highlight",
    motionIntensity: "medium",
    textWeight: "semibold",
    shadowStyle: "subtle",
    highlightStyle: "pill",
    recommendedUse: ["headlines", "updates", "legacy highlight"],
    fallbackSubtitleEffect: "highlight",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Slow fade with cinematic shadow and restrained motion for intros and tributes.",
    entranceEffect: "fade",
    emphasisBehavior: "none",
    motionIntensity: "low",
    textWeight: "normal",
    shadowStyle: "cinematic",
    highlightStyle: "none",
    recommendedUse: ["intros", "tributes", "atmospheric stories"],
    fallbackSubtitleEffect: "fade-up",
  },
];

const CAPTION_PRESETS: readonly CaptionPresetConfig[] = Object.freeze(
  CAPTION_PRESET_DEFINITIONS.map((preset) => Object.freeze({ ...preset })),
);

const PRESET_BY_ID = new Map<CaptionPresetId, CaptionPresetConfig>(
  CAPTION_PRESETS.map((preset) => [preset.id, preset]),
);

/** Returns all caption presets in stable registry order (shallow copy of metadata arrays). */
export function getCaptionPresets(): CaptionPresetConfig[] {
  return CAPTION_PRESETS.map((preset) => ({
    ...preset,
    recommendedUse: [...preset.recommendedUse],
  }));
}

/** Returns a preset config when the id is known. */
export function getCaptionPreset(presetId: string): CaptionPresetConfig | undefined {
  const normalized = presetId.trim().toLowerCase() as CaptionPresetId;
  return PRESET_BY_ID.get(normalized);
}

/** Read-only registry snapshot for diagnostics and verification. */
export function getCaptionPresetRegistry(): readonly CaptionPresetConfig[] {
  return CAPTION_PRESETS;
}
