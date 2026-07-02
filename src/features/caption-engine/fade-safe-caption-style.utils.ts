import type { CaptionPresetId, CaptionPresetScene } from "./caption-engine.types";
import {
  resolveEffectiveSubtitleEffect,
  resolveSceneCaptionPreset,
} from "./caption-engine.utils";

/** Presets that may apply fade-safe visual styling (preview CSS + export canvas). */
export const FADE_SAFE_CAPTION_PRESET_IDS = [
  "minimal",
  "documentary",
  "cinematic",
] as const satisfies readonly CaptionPresetId[];

export type FadeSafeCaptionPresetId = (typeof FADE_SAFE_CAPTION_PRESET_IDS)[number];

export interface FadeSafeCaptionStyleTokens {
  fontWeight: "300" | "500" | "700";
  letterSpacingEm: number;
  lineHeightRatio: number;
  textShadow: { blur: number; color: string; offsetY: number } | null;
}

export interface FadeSafeCaptionStyleResolution {
  presetId: CaptionPresetId;
  usesFadeSafeStyleOverlay: boolean;
  tokens: FadeSafeCaptionStyleTokens | null;
}

/** Shared fade-safe style tokens — preview and export map from the same source. */
export const FADE_SAFE_CAPTION_STYLE_TOKENS: Record<
  FadeSafeCaptionPresetId,
  FadeSafeCaptionStyleTokens
> = {
  minimal: {
    fontWeight: "500",
    letterSpacingEm: 0,
    lineHeightRatio: 1.3,
    textShadow: null,
  },
  documentary: {
    fontWeight: "700",
    letterSpacingEm: 0.025,
    lineHeightRatio: 1.2,
    textShadow: null,
  },
  cinematic: {
    fontWeight: "300",
    letterSpacingEm: 0.06,
    lineHeightRatio: 1.45,
    textShadow: { blur: 16, color: "rgba(0, 0, 0, 0.65)", offsetY: 2 },
  },
};

/** Resolves whether fade-safe preset styling applies for a scene (timing unchanged). */
export function resolveFadeSafeCaptionStyle(
  scene: CaptionPresetScene,
): FadeSafeCaptionStyleResolution {
  const presetId = resolveSceneCaptionPreset(scene);
  const subtitleEffect = resolveEffectiveSubtitleEffect(scene);
  const usesFadeSafeStyleOverlay =
    (FADE_SAFE_CAPTION_PRESET_IDS as readonly CaptionPresetId[]).includes(presetId) &&
    subtitleEffect === "fade-up";
  const tokens = usesFadeSafeStyleOverlay
    ? FADE_SAFE_CAPTION_STYLE_TOKENS[presetId as FadeSafeCaptionPresetId]
    : null;

  return {
    presetId,
    usesFadeSafeStyleOverlay,
    tokens,
  };
}
