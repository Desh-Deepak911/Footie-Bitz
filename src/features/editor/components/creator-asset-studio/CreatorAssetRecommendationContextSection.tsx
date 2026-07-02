"use client";

import type { RecommendationContextLabel } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.scene-view.utils";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import { resolveCreatorAssetSectionClass } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioCardTag, studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetRecommendationContextSectionProps {
  contexts: readonly RecommendationContextLabel[];
}

/**
 * Recommendation context labels derived from planning reasons.
 */
export default function CreatorAssetRecommendationContextSection({
  contexts,
}: CreatorAssetRecommendationContextSectionProps) {
  const compact = useCreatorAssetStudioCompact();

  if (contexts.length === 0) {
    return null;
  }

  return (
    <section className={resolveCreatorAssetSectionClass(compact)}>
      <header className={compact ? "mb-2" : "mb-3"}>
        <p className={studioShellSectionTitle}>Recommendation Context</p>
        <p className={studioSubtleText}>How this recommendation supports the scene</p>
      </header>

      <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2"}`}>
        {contexts.map((context) => (
          <span
            key={context}
            className={
              compact
                ? `${studioCardTag} normal-case tracking-normal bg-emerald-500/10 text-emerald-100 ring-emerald-500/20`
                : "inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100 ring-1 ring-emerald-500/20 transition-opacity duration-300"
            }
          >
            {context}
          </span>
        ))}
      </div>
    </section>
  );
}
