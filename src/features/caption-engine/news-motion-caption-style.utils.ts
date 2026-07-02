import type { CaptionPresetId, CaptionPresetScene } from "./caption-engine.types";
import {
  resolveEffectiveSubtitleEffect,
  resolveSceneCaptionPreset,
} from "./caption-engine.utils";

export const NEWS_CAPTION_PRESET_ID = "news" as const satisfies CaptionPresetId;

/** Slide-in duration — visual only, does not affect highlight timing. */
export const NEWS_SLIDE_DURATION_MS = 320;

/** Minimum subtitle window before news lower-third styling activates. */
export const NEWS_SLIDE_MIN_WINDOW_MS = 350;

export const NEWS_SLIDE_OFFSET_PX = 14;

export interface NewsMotionStyleTokens {
  fontWeight: "600";
  letterSpacingEm: number;
  barGradientStart: string;
  barGradientEnd: string;
}

export const NEWS_MOTION_STYLE_TOKENS: NewsMotionStyleTokens = {
  fontWeight: "600",
  letterSpacingEm: 0.01,
  barGradientStart: "rgba(59, 130, 246, 0.95)",
  barGradientEnd: "rgba(37, 99, 235, 0.85)",
};

export interface NewsMotionOverlayResolution {
  presetId: CaptionPresetId;
  usesNewsMotionOverlay: boolean;
  usesLegacyHighlightFallback: boolean;
}

export interface NewsMotionVisualState {
  slideOffsetPx: number;
  transform: string;
  usesNewsLowerThird: boolean;
}

export interface PreviewNewsMotionMetadata {
  usesNewsMotionOverlay: boolean;
  containerClassName: string;
  textAccentClassName: string;
}

export function inferNewsSlideDisabled(availableDurationMs?: number): boolean {
  return (
    availableDurationMs != null &&
    availableDurationMs > 0 &&
    availableDurationMs < NEWS_SLIDE_MIN_WINDOW_MS
  );
}

export function resolveNewsMotionOverlay(
  scene: CaptionPresetScene & {
    captionTooShortForEffect?: boolean;
    subtitleAvailableDurationMs?: number;
  },
): NewsMotionOverlayResolution {
  const presetId = resolveSceneCaptionPreset(scene);
  const subtitleEffect = resolveEffectiveSubtitleEffect(scene);
  const isNewsHighlight =
    presetId === NEWS_CAPTION_PRESET_ID && subtitleEffect === "highlight";
  const shortWindow =
    scene.captionTooShortForEffect === true ||
    inferNewsSlideDisabled(scene.subtitleAvailableDurationMs);

  return {
    presetId,
    usesNewsMotionOverlay: isNewsHighlight && !shortWindow,
    usesLegacyHighlightFallback: isNewsHighlight && shortWindow,
  };
}

/** Preview CSS overlay for News lower-third highlight (timing unchanged). */
export function resolvePreviewNewsMotionStyle(
  scene: CaptionPresetScene & {
    captionTooShortForEffect?: boolean;
    subtitleAvailableDurationMs?: number;
  },
): PreviewNewsMotionMetadata {
  const overlay = resolveNewsMotionOverlay(scene);

  return {
    usesNewsMotionOverlay: overlay.usesNewsMotionOverlay,
    containerClassName: overlay.usesNewsMotionOverlay
      ? "caption-preset-news !font-semibold tracking-normal origin-center"
      : "",
    textAccentClassName: overlay.usesNewsMotionOverlay ? "caption-preset-news-text" : "",
  };
}

/** Subtle upward slide offset from chunk-local elapsed time (visual only). */
export function resolveNewsSlideOffsetPx(localElapsedMs: number): number {
  if (localElapsedMs <= 0) {
    return NEWS_SLIDE_OFFSET_PX;
  }

  if (localElapsedMs >= NEWS_SLIDE_DURATION_MS) {
    return 0;
  }

  const progress = localElapsedMs / NEWS_SLIDE_DURATION_MS;
  const eased = 1 - Math.pow(1 - progress, 3);

  return NEWS_SLIDE_OFFSET_PX * (1 - eased);
}

/** Resolves slide transform for preview/export from existing animation state. */
export function resolveNewsMotionVisualState(
  overlay: NewsMotionOverlayResolution,
  animationState?: { localElapsedMs: number } | null,
): NewsMotionVisualState {
  if (!overlay.usesNewsMotionOverlay || !animationState) {
    return { slideOffsetPx: 0, transform: "none", usesNewsLowerThird: false };
  }

  const slideOffsetPx = resolveNewsSlideOffsetPx(animationState.localElapsedMs);

  return {
    slideOffsetPx,
    transform: slideOffsetPx === 0 ? "none" : `translateY(${slideOffsetPx}px)`,
    usesNewsLowerThird: true,
  };
}
