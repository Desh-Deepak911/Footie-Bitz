"use client";

import type { SceneIntelligenceViewModel } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.scene-view.utils";
import CreatorAssetProviderContextSection from "@/features/editor/components/creator-asset-studio/CreatorAssetProviderContextSection";
import CreatorAssetRecommendationContextSection from "@/features/editor/components/creator-asset-studio/CreatorAssetRecommendationContextSection";
import CreatorAssetSceneImportanceSection from "@/features/editor/components/creator-asset-studio/CreatorAssetSceneImportanceSection";
import CreatorAssetSceneIntelligenceSection from "@/features/editor/components/creator-asset-studio/CreatorAssetSceneIntelligenceSection";
import CreatorAssetVisualIntentSection from "@/features/editor/components/creator-asset-studio/CreatorAssetVisualIntentSection";

export interface CreatorAssetPlanningContextSectionProps {
  viewModel: SceneIntelligenceViewModel;
  /** When true, sections render inline without an outer wrapper (inside InspectorSection). */
  embedded?: boolean;
}

/**
 * Secondary planning metadata grouped for compact inspector layout.
 */
export default function CreatorAssetPlanningContextSection({
  viewModel,
  embedded = false,
}: CreatorAssetPlanningContextSectionProps) {
  const content = (
    <div className={embedded ? "space-y-2.5" : "space-y-3.5"}>
      <CreatorAssetSceneIntelligenceSection chips={viewModel.intelligenceChips} />
      <CreatorAssetVisualIntentSection intents={viewModel.visualIntents} />
      <CreatorAssetSceneImportanceSection
        importance={viewModel.importance}
        explanation={viewModel.importanceExplanation}
      />
      <CreatorAssetProviderContextSection context={viewModel.providerContext} />
      <CreatorAssetRecommendationContextSection contexts={viewModel.recommendationContexts} />
    </div>
  );

  if (embedded) {
    return content;
  }

  return content;
}
