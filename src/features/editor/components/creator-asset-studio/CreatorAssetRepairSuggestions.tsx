"use client";

import { Check } from "lucide-react";

import type { AssetRepairSuggestion } from "@/features/asset-intelligence/validator/asset-validator.types";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import {
  formatImprovementSuggestion,
  resolveCreatorAssetSectionClass,
} from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetRepairSuggestionsProps {
  suggestions: readonly AssetRepairSuggestion[];
  maxItems?: number;
  /** When true, only a short summary list is shown. */
  summaryOnly?: boolean;
}

/**
 * Positive improvement suggestions — planning only, no auto-fix.
 */
export default function CreatorAssetRepairSuggestions({
  suggestions,
  maxItems = 6,
  summaryOnly = false,
}: CreatorAssetRepairSuggestionsProps) {
  const compact = useCreatorAssetStudioCompact();
  const summaryLimit = summaryOnly ? 2 : maxItems;
  const items = suggestions.slice(0, summaryLimit);

  if (items.length === 0) {
    return (
      <section className={resolveCreatorAssetSectionClass(compact)}>
        <p className={studioShellSectionTitle}>Ways to Improve</p>
        <p className={`${studioSubtleText} mt-2`}>
          Planning looks strong — no improvement suggestions for this scene.
        </p>
      </section>
    );
  }

  return (
    <section className={resolveCreatorAssetSectionClass(compact)}>
      <header className={compact ? "mb-2" : "mb-4"}>
        <p className={studioShellSectionTitle}>Ways to Improve</p>
        <p className={studioSubtleText}>
          {summaryOnly
            ? `${suggestions.length} optional idea${suggestions.length === 1 ? "" : "s"} to strengthen planning`
            : "Optional ideas to strengthen visual planning"}
        </p>
      </header>

      <ul className={compact ? "space-y-1.5" : "space-y-2"}>
        {items.map((suggestion) => (
          <li
            key={suggestion.id}
            className={`flex items-start gap-2 rounded-xl bg-background/25 ring-1 ring-border/15 ${
              compact ? "px-2.5 py-2" : "gap-2.5 px-3.5 py-3 transition hover:bg-background/35 hover:ring-border/25"
            }`}
          >
            <span
              aria-hidden
              className={`inline-flex shrink-0 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/20 ${
                compact ? "mt-0.5 h-4 w-4" : "mt-0.5 h-5 w-5 rounded-full"
              }`}
            >
              <Check className={`${compact ? "h-2.5 w-2.5" : "h-3 w-3"} text-emerald-300`} />
            </span>
            <p className={`${compact ? "text-xs" : "text-sm"} leading-relaxed text-foreground/90`}>
              {formatImprovementSuggestion(suggestion)}
            </p>
          </li>
        ))}
      </ul>

      {summaryOnly && suggestions.length > items.length ? (
        <p className={`${studioSubtleText} mt-2 text-[11px]`}>
          +{suggestions.length - items.length} more in More options
        </p>
      ) : null}
    </section>
  );
}
