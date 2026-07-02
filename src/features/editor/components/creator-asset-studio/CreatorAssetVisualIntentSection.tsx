"use client";

import type { VisualIntentLabel } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.scene-view.utils";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import { resolveCreatorAssetSectionClass } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioCardTag, studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetVisualIntentSectionProps {
  intents: readonly VisualIntentLabel[];
}

/**
 * Visual intent labels derived from planning metadata.
 */
export default function CreatorAssetVisualIntentSection({
  intents,
}: CreatorAssetVisualIntentSectionProps) {
  const compact = useCreatorAssetStudioCompact();

  return (
    <section className={resolveCreatorAssetSectionClass(compact)}>
      <header className={compact ? "mb-2" : "mb-3"}>
        <p className={studioShellSectionTitle}>Visual Intent</p>
        <p className={studioSubtleText}>Recommended visual treatment for this scene</p>
      </header>

      {intents.length > 0 ? (
        <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-2"}`}>
          {intents.map((intent) => (
            <span
              key={intent}
              className={
                compact
                  ? `${studioCardTag} normal-case tracking-normal text-foreground/90`
                  : "inline-flex rounded-full bg-background/35 px-2.5 py-1 text-[11px] font-medium text-foreground/90 ring-1 ring-border/20 transition-opacity duration-300"
              }
            >
              {intent}
            </span>
          ))}
        </div>
      ) : (
        <p className={studioSubtleText}>Visual intent will appear once planning metadata is available.</p>
      )}
    </section>
  );
}
