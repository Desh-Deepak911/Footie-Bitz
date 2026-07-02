"use client";

import {
  DEFAULT_SPEECH_STYLE_PRESET,
  getSpeechStylePresets,
  resolveExpressiveDelivery,
  resolveSpeechStylePreset,
} from "@/features/speech-style";
import {
  studioCard,
  studioCardActive,
  studioChip,
  studioChipActive,
  studioFieldLabel,
  studioSubtleText,
} from "@/lib/utils/studioUi";

import type { SpeechStylePreset } from "./speech-style.types";

export interface SpeechStylePanelProps {
  stylePreset?: SpeechStylePreset;
  expressiveDelivery?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onStylePresetChange: (preset: SpeechStylePreset) => void;
  onExpressiveDeliveryChange: (expressiveDelivery: boolean) => void;
}

export default function SpeechStylePanel({
  stylePreset,
  expressiveDelivery,
  disabled = false,
  compact = false,
  onStylePresetChange,
  onExpressiveDeliveryChange,
}: SpeechStylePanelProps) {
  const selectedPreset = resolveSpeechStylePreset(stylePreset);
  const isExpressive = resolveExpressiveDelivery(selectedPreset, expressiveDelivery);
  const presets = getSpeechStylePresets();

  return (
    <div className={`space-y-2 ${compact ? "space-y-1.5" : ""}`}>
      <div>
        <span className={studioFieldLabel}>Delivery Style</span>
        <div className={`mt-1.5 grid grid-cols-2 ${compact ? "gap-0.5" : "gap-1"}`}>
          {presets.map((preset) => {
            const active = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                title={preset.description}
                onClick={() => onStylePresetChange(preset.id)}
                className={`${active ? studioCardActive : studioCard} justify-center text-center ${
                  compact ? "px-1.5 py-1 text-[10px]" : "px-2 py-1.5 text-[11px]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={studioFieldLabel}>Expressive delivery</p>
          <p className={`${studioSubtleText} ${compact ? "text-[10px]" : "text-[11px]"}`}>
            {selectedPreset === DEFAULT_SPEECH_STYLE_PRESET
              ? "Select a style preset to enable expressive TTS."
              : "Guides pacing and emphasis without changing narration text."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isExpressive}
          disabled={disabled || selectedPreset === DEFAULT_SPEECH_STYLE_PRESET}
          onClick={() => onExpressiveDeliveryChange(!isExpressive)}
          className={`${isExpressive ? studioChipActive : studioChip} shrink-0 px-2.5 py-1 ${
            compact ? "text-[10px]" : "text-[11px]"
          }`}
        >
          {isExpressive ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}
