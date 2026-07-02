"use client";

import { Pin, Sparkles } from "lucide-react";

import type { ProviderRecommendation } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { AssetRecommendation } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";
import type { RecommendationConfidence } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import {
  buildRecommendationExplanation,
  confidenceBadgeClass,
  formatConfidenceWithPercent,
  formatImportanceLabel,
  formatNarrativeRoleLabel,
  formatProviderLabel,
  formatRecommendationTypeLabel,
  importanceBadgeClass,
  resolveCreatorAssetBadgeClass,
  resolveCreatorAssetHeroClass,
} from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioCardTag, studioShellSectionDesc, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetRecommendationCardProps {
  recommendation: AssetRecommendation;
  sceneConfidence: RecommendationConfidence;
  reasoning?: readonly string[];
  primaryProvider?: ProviderRecommendation;
  isPinned?: boolean;
}

function MetaBadge({
  label,
  className,
  compact,
}: {
  label: string;
  className: string;
  compact: boolean;
}) {
  return (
    <span
      className={
        compact
          ? `${studioCardTag} normal-case tracking-normal ${className}`
          : `inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-all duration-300 hover:scale-[1.03] motion-reduce:transform-none ${className}`
      }
    >
      {label}
    </span>
  );
}

/**
 * Hero AI recommendation card — planning metadata only.
 */
export default function CreatorAssetRecommendationCard({
  recommendation,
  sceneConfidence,
  reasoning = [],
  primaryProvider,
  isPinned = false,
}: CreatorAssetRecommendationCardProps) {
  const compact = useCreatorAssetStudioCompact();
  const badgeMotion = resolveCreatorAssetBadgeClass(compact);
  const confidence = formatConfidenceWithPercent(sceneConfidence, recommendation.score);
  const importance = formatImportanceLabel(recommendation.score);
  const recommendationType = formatRecommendationTypeLabel(recommendation);
  const narrativeRole = formatNarrativeRoleLabel(recommendation.semanticRole);
  const explanation = buildRecommendationExplanation({ recommendation, reasoning });

  return (
    <section className={resolveCreatorAssetHeroClass(compact)}>
      <div className={compact ? "flex flex-col gap-2.5" : "flex flex-col gap-4"}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/25 ${
                compact ? "h-8 w-8" : "h-10 w-10"
              }`}
            >
              <Sparkles className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} text-accent`} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent/90">
                  AI Recommendation
                </p>
                {isPinned ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent ring-1 ring-accent/20 ${badgeMotion}`}
                  >
                    <Pin className="h-3 w-3" aria-hidden />
                    Pinned
                  </span>
                ) : null}
              </div>
              {!compact ? (
                <p className={studioShellSectionDesc}>Best match for this scene — planning only.</p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <MetaBadge
              label={confidence.label}
              className={confidenceBadgeClass(sceneConfidence)}
              compact={compact}
            />
            <span className="text-[11px] font-medium tabular-nums text-muted">{confidence.percent}</span>
          </div>
        </div>

        <div
          className={`rounded-xl bg-background/35 ring-1 ring-border/20 ${
            compact ? "px-3 py-2.5" : "px-4 py-3.5"
          }`}
        >
          <p
            className={`${compact ? "text-sm" : "text-[15px]"} font-semibold leading-snug tracking-tight text-foreground`}
          >
            {recommendation.query}
          </p>
          {recommendation.entityNames.length > 0 ? (
            <p className={`${studioSubtleText} mt-1.5`}>{recommendation.entityNames.join(" · ")}</p>
          ) : null}
        </div>

        <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2"}`}>
          <MetaBadge label={importance} className={importanceBadgeClass(recommendation.score)} compact={compact} />
          <MetaBadge
            label={recommendationType}
            className="bg-surface-elevated/55 text-foreground/85 ring-border/25"
            compact={compact}
          />
          {primaryProvider ? (
            <MetaBadge
              label={formatProviderLabel(primaryProvider.providerId)}
              className="bg-accent/10 text-accent ring-accent/20"
              compact={compact}
            />
          ) : null}
          {narrativeRole ? (
            <MetaBadge
              label={narrativeRole}
              className="bg-indigo-500/10 text-indigo-200 ring-indigo-500/20"
              compact={compact}
            />
          ) : null}
        </div>

        <div
          className={`rounded-xl bg-background/25 ring-1 ring-border/15 ${
            compact ? "px-3 py-2.5" : "px-4 py-3.5"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Why this recommendation?
          </p>
          <p className={`mt-1.5 ${compact ? "text-xs" : "text-sm"} leading-relaxed text-foreground/90`}>
            {explanation}
          </p>
        </div>
      </div>
    </section>
  );
}
