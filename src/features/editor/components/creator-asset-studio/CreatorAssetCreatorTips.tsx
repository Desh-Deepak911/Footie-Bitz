"use client";

import { Lightbulb } from "lucide-react";

import type { CreatorTip } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.workflow.utils";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import { resolveCreatorAssetSectionClass } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetCreatorTipsProps {
  tips: readonly CreatorTip[];
}

/**
 * Creator tips generated from validation metadata only.
 */
export default function CreatorAssetCreatorTips({ tips }: CreatorAssetCreatorTipsProps) {
  const compact = useCreatorAssetStudioCompact();

  if (tips.length === 0) {
    return null;
  }

  return (
    <section className={resolveCreatorAssetSectionClass(compact)}>
      <header className={`flex items-center gap-2 ${compact ? "mb-2" : "mb-3"}`}>
        <span
          className={`inline-flex items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 ${
            compact ? "h-7 w-7" : "h-8 w-8"
          }`}
        >
          <Lightbulb className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} text-amber-200`} aria-hidden />
        </span>
        <div>
          <p className={studioShellSectionTitle}>Creator Tips</p>
          <p className={studioSubtleText}>Smart tips from planning validation metadata</p>
        </div>
      </header>

      <ul className={compact ? "space-y-1.5" : "space-y-2"}>
        {tips.map((tip) => (
          <li
            key={tip.id}
            className={`rounded-xl bg-background/25 text-foreground/90 ring-1 ring-border/15 ${
              compact
                ? "px-2.5 py-2 text-xs leading-relaxed"
                : "px-3.5 py-2.5 text-sm leading-relaxed transition-all duration-300 hover:-translate-y-0.5 hover:bg-background/35 hover:ring-border/25 motion-reduce:transform-none"
            }`}
          >
            {tip.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
