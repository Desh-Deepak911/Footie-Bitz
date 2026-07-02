import { getCaptionPreset } from "./caption-preset.registry";
import type {
  CaptionEmphasisBehavior,
  CaptionEntranceEffect,
  CaptionPresetId,
  CaptionPresetScene,
  CaptionShadowStyle,
  CaptionTextWeight,
} from "./caption-engine.types";
import {
  FADE_SAFE_CAPTION_PRESET_IDS,
  resolveFadeSafeCaptionStyle,
  type FadeSafeCaptionPresetId,
} from "./fade-safe-caption-style.utils";

/** @deprecated Use FADE_SAFE_CAPTION_PRESET_IDS */
export const PREVIEW_FADE_SAFE_CAPTION_PRESET_IDS = FADE_SAFE_CAPTION_PRESET_IDS;

export type PreviewFadeSafeCaptionPresetId = FadeSafeCaptionPresetId;

const PREVIEW_PRESET_STYLE_CLASSES: Record<
  PreviewFadeSafeCaptionPresetId,
  { container: string; line: string }
> = {
  minimal: {
    container: "caption-preset-minimal !font-medium tracking-normal",
    line: "",
  },
  documentary: {
    container: "caption-preset-documentary !font-bold tracking-wide",
    line: "leading-snug",
  },
  cinematic: {
    container:
      "caption-preset-cinematic !font-light tracking-[0.06em] [text-shadow:0_2px_16px_rgba(0,0,0,0.65)]",
    line: "leading-relaxed",
  },
};

/** Visual style metadata for preview caption rendering (timing unchanged). */
export interface PreviewCaptionStyleMetadata {
  presetId: CaptionPresetId;
  /** When true, fade-up preview path receives preset CSS overlay only. */
  usesFadeSafeStyleOverlay: boolean;
  containerClassName: string;
  lineClassName: string;
  entranceEffect: CaptionEntranceEffect;
  emphasisBehavior: CaptionEmphasisBehavior;
  textWeight: CaptionTextWeight;
  shadowStyle: CaptionShadowStyle;
}

/** Resolves scene caption preset into preview-only style metadata. */
export function resolvePreviewCaptionStyle(
  scene: CaptionPresetScene,
): PreviewCaptionStyleMetadata {
  const resolution = resolveFadeSafeCaptionStyle(scene);
  const preset = getCaptionPreset(resolution.presetId)!;
  const styleClasses =
    PREVIEW_PRESET_STYLE_CLASSES[resolution.presetId as PreviewFadeSafeCaptionPresetId] ??
    PREVIEW_PRESET_STYLE_CLASSES.minimal;

  return {
    presetId: resolution.presetId,
    usesFadeSafeStyleOverlay: resolution.usesFadeSafeStyleOverlay,
    containerClassName: resolution.usesFadeSafeStyleOverlay ? styleClasses.container : "",
    lineClassName: resolution.usesFadeSafeStyleOverlay ? styleClasses.line : "",
    entranceEffect: preset.entranceEffect,
    emphasisBehavior: preset.emphasisBehavior,
    textWeight: preset.textWeight,
    shadowStyle: preset.shadowStyle,
  };
}

/** Merges preset container classes onto the preview caption root class list. */
export function applyPreviewCaptionStyleClassName(
  baseClassName: string,
  style: PreviewCaptionStyleMetadata,
): string {
  if (!style.usesFadeSafeStyleOverlay || !style.containerClassName.trim()) {
    return baseClassName;
  }

  return `${baseClassName} ${style.containerClassName}`.replace(/\s+/g, " ").trim();
}

/** Merges preset line classes when fade-safe styling is active. */
export function applyPreviewCaptionLineClassName(
  baseClassName: string | undefined,
  style: PreviewCaptionStyleMetadata,
): string | undefined {
  if (!style.usesFadeSafeStyleOverlay || !style.lineClassName.trim()) {
    return baseClassName;
  }

  return baseClassName
    ? `${baseClassName} ${style.lineClassName}`.trim()
    : style.lineClassName;
}
