"use client";

import type { SceneIntelligenceViewModel } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.scene-view.utils";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import {
  importanceBadgeClass,
  resolveCreatorAssetSectionClass,
} from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioCardTag, studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetSceneImportanceSectionProps {
  importance: SceneIntelligenceViewModel["importance"];
  explanation: string;
}

/**
 * Scene importance summary with narrative explanation.
 */
export default function CreatorAssetSceneImportanceSection({
  importance,
  explanation,
}: CreatorAssetSceneImportanceSectionProps) {
  const compact = useCreatorAssetStudioCompact();
  const score =
    importance === "Critical" ? 0.9 : importance === "High" ? 0.72 : importance === "Medium" ? 0.55 : 0.35;

  return (
    <section className={resolveCreatorAssetSectionClass(compact)}>
      <header className={`flex items-start justify-between gap-3 ${compact ? "mb-2" : "mb-3"}`}>
        <div>
          <p className={studioShellSectionTitle}>Scene Importance</p>
          <p className={studioSubtleText}>How much this scene shapes the story</p>
        </div>
        <span
          className={
            compact
              ? `${studioCardTag} font-semibold normal-case tracking-normal ${importanceBadgeClass(score)}`
              : `inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${importanceBadgeClass(score)}`
          }
        >
          {importance}
        </span>
      </header>

      <p className={`${compact ? "text-xs" : "text-sm"} leading-relaxed text-foreground/90`}>{explanation}</p>
    </section>
  );
}
