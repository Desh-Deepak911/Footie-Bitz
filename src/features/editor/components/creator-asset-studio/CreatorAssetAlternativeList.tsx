"use client";

import { ChevronDown } from "lucide-react";

import type { RecommendedAssetCandidate } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import {
  confidenceBadgeClass,
  formatConfidenceWithPercent,
  formatVisualTypeLabel,
  resolveCreatorAssetBadgeClass,
  resolveCreatorAssetSectionClass,
} from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioCardTag, studioCompactButton, studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetAlternativeListProps {
  alternatives: readonly RecommendedAssetCandidate[];
  maxItems?: number;
  expandedComparisonIndex?: number | null;
  onCompare?: (index: number) => void;
}

/**
 * Ranked alternative recommendations as premium cards — read-only planning.
 */
export default function CreatorAssetAlternativeList({
  alternatives,
  maxItems = 5,
  expandedComparisonIndex = null,
  onCompare,
}: CreatorAssetAlternativeListProps) {
  const compact = useCreatorAssetStudioCompact();
  const badgeMotion = resolveCreatorAssetBadgeClass(compact);
  const items = alternatives.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <section className={resolveCreatorAssetSectionClass(compact)}>
        <p className={studioShellSectionTitle}>Alternatives</p>
        <p className={`${studioSubtleText} mt-2`}>No alternate recommendations for this scene.</p>
      </section>
    );
  }

  return (
    <section className={resolveCreatorAssetSectionClass(compact)}>
      <header className={compact ? "mb-2" : "mb-4"}>
        <p className={studioShellSectionTitle}>Alternatives</p>
        <p className={studioSubtleText}>{items.length} other strong options to consider</p>
      </header>

      <div className={`grid ${compact ? "gap-2" : "gap-2.5"}`}>
        {items.map((alternative, index) => {
          const confidence = formatConfidenceWithPercent(alternative.confidence, alternative.score);
          const visualType = formatVisualTypeLabel(alternative.visualIntent ?? alternative.assetRequirementType);
          const reason =
            alternative.reasonLabels[0] ?? "Alternative visual option for this scene.";
          const isExpanded = expandedComparisonIndex === index;

          return (
            <article
              key={`${alternative.query}-${index}`}
              className={`rounded-xl bg-background/30 ring-1 ${
                compact ? "px-3 py-2.5" : "px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-background/40 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] focus-within:ring-accent/25 motion-reduce:transform-none motion-reduce:shadow-none"
              } ${isExpanded ? "ring-accent/25" : "ring-border/15 hover:ring-border/25"}`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                      Option {index + 2}
                    </span>
                    {visualType ? (
                      <span
                        className={
                          compact
                            ? `${studioCardTag} normal-case tracking-normal`
                            : `rounded-full bg-surface-elevated/50 px-2 py-0.5 text-[10px] font-medium text-muted ring-1 ring-border/20 ${badgeMotion}`
                        }
                      >
                        {visualType}
                      </span>
                    ) : null}
                  </div>

                  <p className={`${compact ? "text-xs" : "text-sm"} font-medium leading-snug text-foreground/95`}>
                    {alternative.query}
                  </p>
                  <p className={`${compact ? "text-[11px]" : "text-xs"} leading-relaxed text-muted`}>{reason}</p>
                </div>

                <div className="shrink-0 space-y-1.5 text-right">
                  <span
                    className={
                      compact
                        ? `${studioCardTag} normal-case tracking-normal ${confidenceBadgeClass(alternative.confidence)}`
                        : `inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${confidenceBadgeClass(alternative.confidence)} ${badgeMotion}`
                    }
                  >
                    {confidence.label}
                  </span>
                  <p className="text-[11px] font-medium tabular-nums text-muted">{confidence.percent}</p>
                  {onCompare ? (
                    <button
                      type="button"
                      onClick={() => onCompare(index)}
                      aria-expanded={isExpanded}
                      className={`${studioCompactButton} w-full`}
                    >
                      {isExpanded ? "Hide" : "Compare"}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
