import type { SubtitleEffect } from "@/features/story/types";

import {
  CAPTION_PRESET_ORDER,
  getCaptionPreset,
} from "./caption-preset.registry";
import type { CaptionPresetId, CaptionPresetScene } from "./caption-engine.types";

export const DEFAULT_CAPTION_PRESET: CaptionPresetId = "minimal";

export { CAPTION_PRESET_ORDER };

const LEGACY_SUBTITLE_EFFECTS = new Set<SubtitleEffect>(["fade-up", "typewriter", "highlight"]);

/**
 * Legacy subtitle effect → default v2 preset (registry-only until renderers consume presets).
 * - fade-up → minimal (documentary is the alternate fade preset)
 * - typewriter → tiktok
 * - highlight → news (sports is the alternate highlight preset)
 */
export const LEGACY_SUBTITLE_EFFECT_TO_CAPTION_PRESET: Readonly<
  Record<SubtitleEffect, CaptionPresetId>
> = Object.freeze({
  "fade-up": "minimal",
  typewriter: "tiktok",
  highlight: "news",
});

/** Resolves unknown values to a supported caption preset id. */
export function resolveCaptionPreset(value: unknown): CaptionPresetId {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase() as CaptionPresetId;
    if (CAPTION_PRESET_ORDER.includes(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_CAPTION_PRESET;
}

/** Normalizes legacy subtitle effect tokens without importing caption render utilities. */
export function normalizeLegacySubtitleEffect(value: unknown): SubtitleEffect {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase() as SubtitleEffect;
    if (LEGACY_SUBTITLE_EFFECTS.has(normalized)) {
      return normalized;
    }
  }

  return "fade-up";
}

/** Maps a legacy subtitle effect to its default caption preset. */
export function mapLegacySubtitleEffectToCaptionPreset(
  subtitleEffect: unknown,
): CaptionPresetId {
  return LEGACY_SUBTITLE_EFFECT_TO_CAPTION_PRESET[normalizeLegacySubtitleEffect(subtitleEffect)];
}

/**
 * Resolves the effective caption preset for a scene.
 * Explicit `captionPreset` wins; otherwise derives from legacy `subtitleEffect`.
 */
export function resolveSceneCaptionPreset(scene: CaptionPresetScene): CaptionPresetId {
  if (scene.captionPreset != null && String(scene.captionPreset).trim() !== "") {
    return resolveCaptionPreset(scene.captionPreset);
  }

  return mapLegacySubtitleEffectToCaptionPreset(scene.subtitleEffect);
}

/**
 * Returns the legacy subtitle effect that should drive current renderers.
 * Explicit `subtitleEffect` on the scene always wins; preset fallback is registry-only metadata.
 */
export function resolveEffectiveSubtitleEffect(scene: CaptionPresetScene): SubtitleEffect {
  if (scene.subtitleEffect != null && String(scene.subtitleEffect).trim() !== "") {
    return normalizeLegacySubtitleEffect(scene.subtitleEffect);
  }

  const preset = resolveSceneCaptionPreset(scene);
  return getCaptionPreset(preset)?.fallbackSubtitleEffect ?? "fade-up";
}

/** Caption preset option list for future UI (registry-only in 3.9F-1). */
export function getCaptionPresetOptions(): { value: CaptionPresetId; label: string }[] {
  return CAPTION_PRESET_ORDER.map((id) => ({
    value: id,
    label: getCaptionPreset(id)?.label ?? id,
  }));
}

/** Scene patch when a caption preset is selected — keeps legacy subtitleEffect in sync. */
export function buildSceneCaptionPresetPatch(presetId: CaptionPresetId): {
  captionPreset: CaptionPresetId;
  subtitleEffect: SubtitleEffect;
} {
  const captionPreset = resolveCaptionPreset(presetId);
  const preset = getCaptionPreset(captionPreset);

  return {
    captionPreset,
    subtitleEffect: preset?.fallbackSubtitleEffect ?? "fade-up",
  };
}

/** Scene patch when legacy subtitle effect is chosen in advanced controls. */
export function buildSceneSubtitleEffectPatch(effect: SubtitleEffect): {
  captionPreset: CaptionPresetId;
  subtitleEffect: SubtitleEffect;
} {
  const subtitleEffect = normalizeLegacySubtitleEffect(effect);

  return {
    captionPreset: mapLegacySubtitleEffectToCaptionPreset(subtitleEffect),
    subtitleEffect,
  };
}
