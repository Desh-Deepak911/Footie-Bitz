import type { CaptionPresetId, CaptionPresetScene } from "./caption-engine.types";
import {
  resolveEffectiveSubtitleEffect,
  resolveSceneCaptionPreset,
} from "./caption-engine.utils";

export const SPORTS_CAPTION_PRESET_ID = "sports" as const satisfies CaptionPresetId;

/** Bounce entrance duration — visual only, does not affect highlight timing. */
export const SPORTS_BOUNCE_DURATION_MS = 280;

/** Minimum subtitle window before sports bounce/glow activates. */
export const SPORTS_BOUNCE_MIN_WINDOW_MS = 400;

export const SPORTS_BOUNCE_START_SCALE = 0.94;
export const SPORTS_BOUNCE_END_SCALE = 1;

export interface SportsMotionStyleTokens {
  fontWeight: "700";
  letterSpacingEm: number;
  glowColor: string;
  glowBlurPx: number;
}

export const SPORTS_MOTION_STYLE_TOKENS: SportsMotionStyleTokens = {
  fontWeight: "700",
  letterSpacingEm: 0.02,
  glowColor: "rgba(250, 204, 21, 0.45)",
  glowBlurPx: 14,
};

export interface SportsMotionOverlayResolution {
  presetId: CaptionPresetId;
  usesSportsMotionOverlay: boolean;
  usesLegacyHighlightFallback: boolean;
}

export interface SportsMotionVisualState {
  bounceScale: number;
  transform: string;
  usesSportsGlow: boolean;
}

export interface PreviewSportsMotionMetadata {
  usesSportsMotionOverlay: boolean;
  containerClassName: string;
  textGlowClassName: string;
}

export function inferSportsBounceDisabled(availableDurationMs?: number): boolean {
  return (
    availableDurationMs != null &&
    availableDurationMs > 0 &&
    availableDurationMs < SPORTS_BOUNCE_MIN_WINDOW_MS
  );
}

export function resolveSportsMotionOverlay(
  scene: CaptionPresetScene & {
    captionTooShortForEffect?: boolean;
    subtitleAvailableDurationMs?: number;
  },
): SportsMotionOverlayResolution {
  const presetId = resolveSceneCaptionPreset(scene);
  const subtitleEffect = resolveEffectiveSubtitleEffect(scene);
  const isSportsHighlight =
    presetId === SPORTS_CAPTION_PRESET_ID && subtitleEffect === "highlight";
  const shortWindow =
    scene.captionTooShortForEffect === true ||
    inferSportsBounceDisabled(scene.subtitleAvailableDurationMs);

  return {
    presetId,
    usesSportsMotionOverlay: isSportsHighlight && !shortWindow,
    usesLegacyHighlightFallback: isSportsHighlight && shortWindow,
  };
}

/** Preview CSS overlay for Sports highlight motion (timing unchanged). */
export function resolvePreviewSportsMotionStyle(
  scene: CaptionPresetScene & {
    captionTooShortForEffect?: boolean;
    subtitleAvailableDurationMs?: number;
  },
): PreviewSportsMotionMetadata {
  const overlay = resolveSportsMotionOverlay(scene);

  return {
    usesSportsMotionOverlay: overlay.usesSportsMotionOverlay,
    containerClassName: overlay.usesSportsMotionOverlay
      ? "caption-preset-sports !font-bold tracking-wide origin-center"
      : "",
    textGlowClassName: overlay.usesSportsMotionOverlay
      ? "caption-preset-sports-glow [text-shadow:0_0_12px_rgba(250,204,21,0.55)]"
      : "",
  };
}

/** Subtle bounce scale from chunk-local elapsed time (visual only). */
export function resolveSportsBounceScale(localElapsedMs: number): number {
  if (localElapsedMs <= 0) {
    return SPORTS_BOUNCE_START_SCALE;
  }

  if (localElapsedMs >= SPORTS_BOUNCE_DURATION_MS) {
    return SPORTS_BOUNCE_END_SCALE;
  }

  const progress = localElapsedMs / SPORTS_BOUNCE_DURATION_MS;
  const eased = 1 - Math.pow(1 - progress, 3);
  const bounce = Math.sin(progress * Math.PI) * 0.02;

  return (
    SPORTS_BOUNCE_START_SCALE +
    (SPORTS_BOUNCE_END_SCALE - SPORTS_BOUNCE_START_SCALE) * eased +
    bounce * (1 - progress)
  );
}

/** Resolves bounce/glow visual state for preview/export from existing animation state. */
export function resolveSportsMotionVisualState(
  overlay: SportsMotionOverlayResolution,
  animationState?: { localElapsedMs: number } | null,
): SportsMotionVisualState {
  if (!overlay.usesSportsMotionOverlay || !animationState) {
    return { bounceScale: 1, transform: "none", usesSportsGlow: false };
  }

  const bounceScale = resolveSportsBounceScale(animationState.localElapsedMs);

  return {
    bounceScale,
    transform: bounceScale === 1 ? "none" : `scale(${bounceScale})`,
    usesSportsGlow: true,
  };
}
