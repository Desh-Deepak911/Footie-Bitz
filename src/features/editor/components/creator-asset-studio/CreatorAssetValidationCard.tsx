"use client";

import type { AssetValidationResult } from "@/features/asset-intelligence/validator/asset-validator.types";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import {
  formatPlanningScore,
  resolveCreatorAssetSectionClass,
} from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioCardTag, studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetValidationCardProps {
  validationResult: AssetValidationResult;
  /** When true, only the overall score and notes summary are shown. */
  summaryOnly?: boolean;
}

interface QualityMetric {
  label: string;
  value: number;
}

function QualityMetricCard({ label, value, compact }: QualityMetric & { compact: boolean }) {
  const width = `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;

  return (
    <div className={`rounded-xl bg-background/25 ring-1 ring-border/15 ${compact ? "px-2.5 py-2" : "px-3.5 py-3"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`${compact ? "text-[11px]" : "text-xs"} font-medium text-foreground/90`}>{label}</p>
        <p className={`${compact ? "text-[11px]" : "text-xs"} font-semibold tabular-nums text-muted`}>
          {formatPlanningScore(value)}
        </p>
      </div>
      <div
        className={`overflow-hidden rounded-full bg-surface-elevated/50 ring-1 ring-border/15 ${
          compact ? "mt-1.5 h-1.5" : "mt-2.5 h-2"
        }`}
        role="progressbar"
        aria-valuenow={Math.round(value * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width }}
        />
      </div>
    </div>
  );
}

/**
 * Quality assessment card — planning audit scores only.
 */
export default function CreatorAssetValidationCard({
  validationResult,
  summaryOnly = false,
}: CreatorAssetValidationCardProps) {
  const compact = useCreatorAssetStudioCompact();
  const metrics: QualityMetric[] = [
    { label: "Recommendation Quality", value: validationResult.recommendationQualityScore },
    { label: "Entity Coverage", value: validationResult.entityCoverageScore },
    { label: "Provider Match", value: validationResult.providerQualityScore },
    { label: "Visual Diversity", value: validationResult.visualDiversityScore },
  ];

  return (
    <section className={resolveCreatorAssetSectionClass(compact)}>
      <header className={`flex items-start justify-between gap-3 ${compact ? "mb-2" : "mb-4"}`}>
        <div>
          <p className={studioShellSectionTitle}>Quality Assessment</p>
          <p className={studioSubtleText}>
            {summaryOnly ? "Planning quality overview" : "Planning quality signals — read only"}
          </p>
        </div>
        <span
          className={
            compact
              ? `${studioCardTag} font-semibold normal-case tracking-normal bg-accent/10 text-accent ring-accent/20`
              : "inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent ring-1 ring-accent/20"
          }
        >
          {formatPlanningScore(validationResult.validationScore)}
        </span>
      </header>

      {!summaryOnly ? (
        <div className={`grid gap-2.5 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
          {metrics.map((metric) => (
            <QualityMetricCard key={metric.label} label={metric.label} value={metric.value} compact={compact} />
          ))}
        </div>
      ) : (
        <p className={`${studioSubtleText} text-[11px]`}>
          Recommendation {formatPlanningScore(validationResult.recommendationQualityScore)} · Coverage{" "}
          {formatPlanningScore(validationResult.entityCoverageScore)} · Provider{" "}
          {formatPlanningScore(validationResult.providerQualityScore)} · Diversity{" "}
          {formatPlanningScore(validationResult.visualDiversityScore)}
        </p>
      )}

      {validationResult.warnings.length > 0 ? (
        <div
          className={`rounded-xl bg-amber-500/5 ring-1 ring-amber-500/15 ${
            compact ? "mt-2.5 px-2.5 py-2" : "mt-4 px-3.5 py-3"
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">Notes</p>
          <ul className="mt-1.5 space-y-1">
            {validationResult.warnings.slice(0, summaryOnly ? 2 : 3).map((warning) => (
              <li key={warning} className="text-xs leading-relaxed text-foreground/80">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
