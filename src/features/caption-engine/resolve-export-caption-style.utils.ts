import type { CaptionPresetId, CaptionPresetScene } from "./caption-engine.types";
import {
  FADE_SAFE_CAPTION_STYLE_TOKENS,
  resolveFadeSafeCaptionStyle,
  type FadeSafeCaptionPresetId,
  type FadeSafeCaptionStyleTokens,
} from "./fade-safe-caption-style.utils";
import {
  resolveTikTokMotionOverlay,
  TIKTOK_MOTION_STYLE_TOKENS,
  type TikTokMotionOverlayResolution,
} from "./tiktok-motion-caption-style.utils";

/** Default export subtitle styling when no fade-safe preset overlay applies. */
export const LEGACY_EXPORT_CAPTION_STYLE_TOKENS: FadeSafeCaptionStyleTokens = {
  fontWeight: "700",
  letterSpacingEm: 0,
  lineHeightRatio: 1.3,
  textShadow: null,
};

/** Canvas text styling metadata for export subtitle rendering. */
export interface ExportCaptionStyleMetadata {
  presetId: CaptionPresetId;
  usesFadeSafeStyleOverlay: boolean;
  fontWeight: string;
  letterSpacingEm: number;
  lineHeightRatio: number;
  textShadow: FadeSafeCaptionStyleTokens["textShadow"];
}

/** Resolves export style for a subtitle display frame (generated captions stay legacy). */
export function resolveExportCaptionStyleForDisplay(
  display?: {
    captionPreset?: string | null;
    effect?: string | null;
    captionTooShortForEffect?: boolean;
  },
): ExportCaptionStyleMetadata {
  if (!display) {
    return {
      presetId: "minimal",
      usesFadeSafeStyleOverlay: false,
      fontWeight: LEGACY_EXPORT_CAPTION_STYLE_TOKENS.fontWeight,
      letterSpacingEm: LEGACY_EXPORT_CAPTION_STYLE_TOKENS.letterSpacingEm,
      lineHeightRatio: LEGACY_EXPORT_CAPTION_STYLE_TOKENS.lineHeightRatio,
      textShadow: LEGACY_EXPORT_CAPTION_STYLE_TOKENS.textShadow,
    };
  }

  const tiktokOverlay = resolveTikTokMotionOverlay({
    captionPreset: display.captionPreset,
    subtitleEffect: display.effect,
    captionTooShortForEffect: display.captionTooShortForEffect,
  });
  const tiktokStyle = resolveTikTokExportCaptionStyle(tiktokOverlay);
  if (tiktokStyle) {
    return tiktokStyle;
  }

  return resolveExportCaptionStyle({
    captionPreset: display.captionPreset,
    subtitleEffect: display.effect,
  });
}

function resolveTikTokExportCaptionStyle(
  overlay: TikTokMotionOverlayResolution,
): ExportCaptionStyleMetadata | null {
  if (!overlay.usesTikTokMotionOverlay) {
    return null;
  }

  return {
    presetId: overlay.presetId,
    usesFadeSafeStyleOverlay: false,
    fontWeight: TIKTOK_MOTION_STYLE_TOKENS.fontWeight,
    letterSpacingEm: TIKTOK_MOTION_STYLE_TOKENS.letterSpacingEm,
    lineHeightRatio: TIKTOK_MOTION_STYLE_TOKENS.lineHeightRatio,
    textShadow: null,
  };
}

/** Resolves export caption style from scene preset + effective subtitle effect. */
export function resolveExportCaptionStyle(
  scene: CaptionPresetScene,
): ExportCaptionStyleMetadata {
  const resolution = resolveFadeSafeCaptionStyle(scene);
  const tokens = resolution.tokens ?? LEGACY_EXPORT_CAPTION_STYLE_TOKENS;

  return {
    presetId: resolution.presetId,
    usesFadeSafeStyleOverlay: resolution.usesFadeSafeStyleOverlay,
    fontWeight: tokens.fontWeight,
    letterSpacingEm: tokens.letterSpacingEm,
    lineHeightRatio: tokens.lineHeightRatio,
    textShadow: tokens.textShadow,
  };
}

/** Applies export caption font, tracking, and shadow before drawing text. */
export function applyExportCaptionTextDrawState(
  ctx: CanvasRenderingContext2D,
  fontSize: number,
  style: ExportCaptionStyleMetadata,
  scale: number,
): void {
  ctx.font = `${style.fontWeight} ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.letterSpacing =
    style.letterSpacingEm !== 0 ? `${fontSize * style.letterSpacingEm}px` : "0px";

  if (style.textShadow) {
    ctx.shadowBlur = style.textShadow.blur * scale;
    ctx.shadowColor = style.textShadow.color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = style.textShadow.offsetY * scale;
  }
}

/** Resets letter-spacing and shadow after export caption text is drawn. */
export function resetExportCaptionTextDrawState(ctx: CanvasRenderingContext2D): void {
  ctx.letterSpacing = "0px";
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** Maps preset id to shared fade-safe tokens for preview/export parity checks. */
export function getFadeSafeCaptionStyleTokensForPreset(
  presetId: FadeSafeCaptionPresetId,
): FadeSafeCaptionStyleTokens {
  return FADE_SAFE_CAPTION_STYLE_TOKENS[presetId];
}
