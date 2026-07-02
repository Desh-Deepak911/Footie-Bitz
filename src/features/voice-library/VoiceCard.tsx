"use client";

import { Loader2, Volume2 } from "lucide-react";

import { useVoicePreview } from "@/features/voice-preview";
import { voiceRequiresGpt4oMiniTts } from "@/lib/utils/tts-voice-compat.utils";
import {
  studioCard,
  studioCardActive,
  studioCardTag,
  studioCompactButton,
  studioSubtleText,
} from "@/lib/utils/studioUi";

import type { VoiceCardProps } from "./voice-library.types";

export default function VoiceCard({
  voice,
  selected,
  disabled = false,
  compact = false,
  previewSpeed,
  previewStylePreset,
  previewExpressiveDelivery,
  onSelect,
}: VoiceCardProps) {
  const { state, error, handlePreview } = useVoicePreview({
    voiceId: voice.id,
    speed: previewSpeed,
    stylePreset: previewStylePreset,
    expressiveDelivery: previewExpressiveDelivery,
    disabled,
  });

  const showExpressiveBadge = voiceRequiresGpt4oMiniTts(voice.id);

  return (
    <div className={`${selected ? studioCardActive : studioCard} flex w-full flex-col gap-1`}>
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          role="option"
          aria-selected={selected}
          disabled={disabled}
          onClick={() => onSelect(voice.id)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-1">
            <span className={`font-medium text-foreground/95 ${compact ? "text-xs" : "text-sm"}`}>
              {voice.displayName}
            </span>
            {showExpressiveBadge ? (
              <span className={`${studioCardTag} normal-case tracking-normal text-accent/90`}>
                Expressive
              </span>
            ) : null}
          </div>

          {!compact ? (
            <span
              className={`${studioSubtleText} mt-0.5 line-clamp-1 ${compact ? "text-[10px]" : "text-[11px]"}`}
            >
              {voice.description}
            </span>
          ) : null}

          <span className="mt-1 flex flex-wrap gap-0.5">
            {voice.toneTags.slice(0, 2).map((tag) => (
              <span key={tag} className={studioCardTag}>
                {tag}
              </span>
            ))}
          </span>
        </button>

        <button
          type="button"
          disabled={disabled || state === "loading"}
          onClick={handlePreview}
          aria-label={`Preview ${voice.displayName}`}
          aria-pressed={state === "playing"}
          className={`${studioCompactButton} shrink-0 px-1.5 py-0.5 ${
            compact ? "text-[10px]" : "text-[11px]"
          } ${state === "playing" ? "ring-1 ring-accent/40" : ""}`}
        >
          {state === "loading" ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : (
            <Volume2 className="h-3 w-3" aria-hidden />
          )}
          <span className="sr-only">{state === "playing" ? "Playing" : "Preview"}</span>
        </button>
      </div>

      {error ? (
        <span className={`${studioSubtleText} line-clamp-1 text-[10px] text-rose-300`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
