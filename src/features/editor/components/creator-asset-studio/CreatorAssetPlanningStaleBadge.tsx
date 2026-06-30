"use client";

import { AlertTriangle } from "lucide-react";

import {
  PLANNING_REFRESH_COMING_SOON_COPY,
  type PlanningStaleBadgeViewModel,
  type PlanningStaleChipViewModel,
} from "@/features/editor/components/creator-asset-studio/creator-asset-studio.staleness.utils";
import { studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetPlanningStaleBadgeProps {
  badge: PlanningStaleBadgeViewModel;
  chips: PlanningStaleChipViewModel[];
}

const BADGE_STYLES: Record<PlanningStaleBadgeViewModel["level"], string> = {
  partial: "bg-amber-500/10 text-amber-100 ring-amber-400/30",
  full: "bg-orange-500/12 text-orange-100 ring-orange-400/35",
  identity: "bg-sky-500/10 text-sky-100 ring-sky-400/30",
};

/**
 * Stale planning indicator — presentation only, no refresh action.
 */
export default function CreatorAssetPlanningStaleBadge({
  badge,
  chips,
}: CreatorAssetPlanningStaleBadgeProps) {
  return (
    <section
      aria-live="polite"
      aria-atomic="true"
      aria-label={badge.ariaLabel}
      className="space-y-2.5 rounded-2xl bg-surface-elevated/25 px-4 py-3 ring-1 ring-border/20"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ring-1 ${BADGE_STYLES[badge.level]}`}
          aria-hidden
        >
          <AlertTriangle className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-foreground">{badge.title}</p>
          <p className={`${studioSubtleText} text-xs leading-relaxed`}>
            {PLANNING_REFRESH_COMING_SOON_COPY}
          </p>
        </div>
      </div>

      {chips.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Planning change reasons">
          {chips.map((chip) => (
            <li key={chip.id}>
              <span className="inline-flex rounded-full bg-surface-elevated/60 px-2.5 py-1 text-[11px] font-medium text-foreground/85 ring-1 ring-border/25">
                {chip.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
