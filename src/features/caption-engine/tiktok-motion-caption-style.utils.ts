import { estimateTypewriterRevealDurationMs } from "@/features/story/utils/subtitle-effect.utils";

import type { CaptionPresetId, CaptionPresetScene } from "./caption-engine.types";
import {
  resolveEffectiveSubtitleEffect,
  resolveSceneCaptionPreset,
} from "./caption-engine.utils";

export const TIKTOK_CAPTION_PRESET_ID = "tiktok" as const satisfies CaptionPresetId;

/** Pop entrance duration — visual only, does not affect typewriter reveal timing. */
export const TIKTOK_POP_DURATION_MS = 220;

export const TIKTOK_POP_START_SCALE = 0.92;
export const TIKTOK_POP_END_SCALE = 1;

export interface TikTokMotionStyleTokens {
  fontWeight: "700";
  letterSpacingEm: number;
  lineHeightRatio: number;
}

export const TIKTOK_MOTION_STYLE_TOKENS: TikTokMotionStyleTokens = {
  fontWeight: "700",
  letterSpacingEm: -0.015,
  lineHeightRatio: 1.3,
};

export interface TikTokMotionOverlayResolution {
  presetId: CaptionPresetId;
  usesTikTokMotionOverlay: boolean;
  usesLegacyTypewriterFallback: boolean;
}

export interface TikTokMotionVisualState {
  popScale: number;
  transform: string;
}

export interface PreviewTikTokMotionMetadata {
  usesTikTokMotionOverlay: boolean;
  containerClassName: string;
}

export function resolveTikTokMotionOverlay(
  scene: CaptionPresetScene & { captionTooShortForEffect?: boolean },
): TikTokMotionOverlayResolution {
  const presetId = resolveSceneCaptionPreset(scene);
  const subtitleEffect = resolveEffectiveSubtitleEffect(scene);
  const isTikTokTypewriter =
    presetId === TIKTOK_CAPTION_PRESET_ID && subtitleEffect === "typewriter";
  const captionTooShortForEffect = scene.captionTooShortForEffect === true;

  return {
    presetId,
    usesTikTokMotionOverlay: isTikTokTypewriter && !captionTooShortForEffect,
    usesLegacyTypewriterFallback: isTikTokTypewriter && captionTooShortForEffect,
  };
}

/** Preview CSS overlay for TikTok typewriter motion (timing unchanged). */
export function resolvePreviewTikTokMotionStyle(
  scene: CaptionPresetScene & { captionTooShortForEffect?: boolean },
): PreviewTikTokMotionMetadata {
  const overlay = resolveTikTokMotionOverlay(scene);

  return {
    usesTikTokMotionOverlay: overlay.usesTikTokMotionOverlay,
    containerClassName: overlay.usesTikTokMotionOverlay
      ? "caption-preset-tiktok !font-bold tracking-tight origin-center"
      : "",
  };
}

/** Subtle pop scale from chunk-local elapsed time (visual only). */
export function resolveTikTokPopScale(localElapsedMs: number): number {
  if (localElapsedMs <= 0) {
    return TIKTOK_POP_START_SCALE;
  }

  if (localElapsedMs >= TIKTOK_POP_DURATION_MS) {
    return TIKTOK_POP_END_SCALE;
  }

  const progress = localElapsedMs / TIKTOK_POP_DURATION_MS;
  const eased = 1 - Math.pow(1 - progress, 3);

  return (
    TIKTOK_POP_START_SCALE +
    (TIKTOK_POP_END_SCALE - TIKTOK_POP_START_SCALE) * eased
  );
}

/** Resolves pop transform for preview/export from existing animation state. */
export function resolveTikTokMotionVisualState(
  overlay: TikTokMotionOverlayResolution,
  animationState?: { localElapsedMs: number } | null,
): TikTokMotionVisualState {
  if (!overlay.usesTikTokMotionOverlay || !animationState) {
    return { popScale: 1, transform: "none" };
  }

  const popScale = resolveTikTokPopScale(animationState.localElapsedMs);

  return {
    popScale,
    transform: popScale === 1 ? "none" : `scale(${popScale})`,
  };
}

/** Infers short-window fallback for legacy export paths without timeline metadata. */
export function inferCaptionTooShortForTypewriter(
  activeChunk: string,
  availableDurationMs: number,
): boolean {
  const trimmed = activeChunk.trim();
  if (!trimmed || availableDurationMs <= 0) {
    return false;
  }

  return estimateTypewriterRevealDurationMs(trimmed) > availableDurationMs;
}
