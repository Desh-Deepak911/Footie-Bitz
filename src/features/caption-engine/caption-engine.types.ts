import type { SubtitleEffect } from "@/features/story/types";

/** Caption Engine v2 preset identifiers. */
export type CaptionPresetId =
  | "minimal"
  | "documentary"
  | "tiktok"
  | "sports"
  | "news"
  | "cinematic";

/** Entrance animation style (future renderer — not wired in 3.9F-1). */
export type CaptionEntranceEffect = "fade" | "slide" | "pop" | "bounce";

/** Word/line emphasis behavior (future renderer — not wired in 3.9F-1). */
export type CaptionEmphasisBehavior = "none" | "highlight" | "karaoke" | "glow";

export type CaptionMotionIntensity = "low" | "medium" | "high";

export type CaptionTextWeight = "normal" | "semibold" | "bold";

export type CaptionShadowStyle = "none" | "subtle" | "strong" | "cinematic";

export type CaptionHighlightStyle = "none" | "bar" | "pill" | "sweep";

/** Immutable caption preset definition for Caption Engine v2. */
export interface CaptionPresetConfig {
  id: CaptionPresetId;
  label: string;
  description: string;
  entranceEffect: CaptionEntranceEffect;
  emphasisBehavior: CaptionEmphasisBehavior;
  motionIntensity: CaptionMotionIntensity;
  textWeight: CaptionTextWeight;
  shadowStyle: CaptionShadowStyle;
  highlightStyle: CaptionHighlightStyle;
  recommendedUse: string[];
  /** Legacy {@link SubtitleEffect} used until v2 renderers consume preset tokens. */
  fallbackSubtitleEffect: SubtitleEffect;
}

/** Scene fields used to resolve a caption preset without mutating scene data. */
export type CaptionPresetScene = {
  captionPreset?: CaptionPresetId | string | null;
  subtitleEffect?: SubtitleEffect | string | null;
};
