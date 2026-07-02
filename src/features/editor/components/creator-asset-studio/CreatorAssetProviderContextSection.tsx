"use client";

import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import { resolveCreatorAssetSectionClass } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import { studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface CreatorAssetProviderContextSectionProps {
  context: string | null;
}

/**
 * Provider selection explanation derived from planning metadata.
 */
export default function CreatorAssetProviderContextSection({
  context,
}: CreatorAssetProviderContextSectionProps) {
  const compact = useCreatorAssetStudioCompact();

  if (!context) {
    return null;
  }

  return (
    <section className={resolveCreatorAssetSectionClass(compact)}>
      <header className={compact ? "mb-2" : "mb-3"}>
        <p className={studioShellSectionTitle}>Provider Context</p>
        <p className={studioSubtleText}>Why this provider fits the scene</p>
      </header>

      <p className={`${compact ? "text-xs" : "text-sm"} leading-relaxed text-foreground/90`}>{context}</p>
    </section>
  );
}
