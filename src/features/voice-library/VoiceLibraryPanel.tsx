"use client";

import { useMemo, useState } from "react";

import { studioChip, studioChipActive, studioFieldLabel, studioSubtleText } from "@/lib/utils/studioUi";

import VoiceCard from "./VoiceCard";
import { VOICE_CATEGORY_LABELS, VOICE_LIBRARY_CATEGORY_ORDER } from "./voice-library.registry";
import type { VoiceLibraryFilter, VoiceLibraryPanelProps } from "./voice-library.types";
import {
  filterVoiceLibraryEntries,
  resolveVoiceLibraryDisplayName,
  resolveVoiceLibrarySelection,
} from "./voice-library.utils";

const FILTER_OPTIONS: Array<{ id: VoiceLibraryFilter; label: string }> = [
  { id: "all", label: "All" },
  ...VOICE_LIBRARY_CATEGORY_ORDER.map((category) => ({
    id: category,
    label: VOICE_CATEGORY_LABELS[category],
  })),
];

export default function VoiceLibraryPanel({
  selectedVoiceId,
  onVoiceSelect,
  disabled = false,
  compact = false,
  labelledBy,
  previewSpeed,
  previewStylePreset,
  previewExpressiveDelivery,
}: VoiceLibraryPanelProps) {
  const [activeFilter, setActiveFilter] = useState<VoiceLibraryFilter>("all");
  const resolvedSelection = resolveVoiceLibrarySelection(selectedVoiceId);
  const visibleVoices = useMemo(
    () => filterVoiceLibraryEntries(activeFilter),
    [activeFilter],
  );

  return (
    <div
      className={`space-y-2 ${compact ? "space-y-1.5" : ""}`}
      role="listbox"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : "Voice library"}
      aria-activedescendant={`voice-option-${resolvedSelection}`}
    >
      {!labelledBy ? (
        <p className={studioFieldLabel}>Voice</p>
      ) : null}

      <p className={`${studioSubtleText} ${compact ? "text-[10px]" : "text-[11px]"}`}>
        Selected: {resolveVoiceLibraryDisplayName(resolvedSelection)}
      </p>

      <div
        role="tablist"
        aria-label="Voice categories"
        className={`flex flex-wrap ${compact ? "gap-0.5" : "gap-1"}`}
      >
        {FILTER_OPTIONS.map((option) => {
          const active = activeFilter === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => setActiveFilter(option.id)}
              className={`${active ? studioChipActive : studioChip} ${
                compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        className={`grid max-h-[min(24rem,50vh)] grid-cols-2 overflow-y-auto overscroll-contain pr-0.5 ${
          compact ? "gap-1" : "gap-1.5"
        }`}
      >
        {visibleVoices.map((voice) => (
          <div key={voice.id} id={`voice-option-${voice.id}`}>
            <VoiceCard
              voice={voice}
              selected={voice.id === resolvedSelection}
              disabled={disabled}
              compact={compact}
              previewSpeed={previewSpeed}
              previewStylePreset={previewStylePreset}
              previewExpressiveDelivery={previewExpressiveDelivery}
              onSelect={onVoiceSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
