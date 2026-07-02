"use client";

import { Search } from "lucide-react";

import { formatProviderDisplayName } from "@/features/editor/components/asset-browser/asset-browser.utils";
import type { AssetBrowserInitialSearchContext } from "@/features/editor/components/asset-browser/asset-browser.types";
import { resolveHandoffProviderOrder } from "@/features/editor/components/asset-browser/asset-browser.handoff.utils";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import {
  resolveCreatorAssetSectionClass,
} from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import {
  studioActionButton,
  studioCardTag,
  studioShellSectionTitle,
  studioSubtleText,
} from "@/lib/utils/studioUi";

export interface CreatorAssetSearchAssetsCtaProps {
  initialSearchContext: AssetBrowserInitialSearchContext;
  onSearchAssets: () => void;
}

/**
 * Opens the read-only Asset Browser with the scene recommendation query prefilled.
 */
export default function CreatorAssetSearchAssetsCta({
  initialSearchContext,
  onSearchAssets,
}: CreatorAssetSearchAssetsCtaProps) {
  const compact = useCreatorAssetStudioCompact();
  const providerOrder = resolveHandoffProviderOrder(initialSearchContext.rankedProviderIds);

  if (compact) {
    return (
      <section className={resolveCreatorAssetSectionClass(true)}>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <p className={studioShellSectionTitle}>Search Assets</p>
        </div>

        <p className={`${studioSubtleText} mt-1.5 line-clamp-2`}>
          Open the Asset Browser with this scene&apos;s recommended query prefilled — browse only.
        </p>

        <p
          className="mt-2.5 truncate rounded-md bg-background/40 px-2 py-1 font-mono text-[11px] leading-snug text-foreground/90 ring-1 ring-border/20"
          title={initialSearchContext.query}
        >
          {initialSearchContext.query}
        </p>

        {providerOrder.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {providerOrder.map((providerId) => (
              <span key={providerId} className={studioCardTag}>
                {formatProviderDisplayName(providerId)}
              </span>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          className={`${studioActionButton} mt-3 w-full`}
          onClick={onSearchAssets}
        >
          <Search className="h-4 w-4" aria-hidden />
          Search Assets
        </button>
      </section>
    );
  }

  return (
    <section className={`${resolveCreatorAssetSectionClass(false)} transition hover:ring-border/25`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <p className={studioShellSectionTitle}>Search Assets</p>
          </div>
          <p className={studioSubtleText}>
            Open the Asset Browser with this scene&apos;s recommended query prefilled — browse only.
          </p>
          <p className="truncate font-mono text-[12px] text-foreground/90">
            {initialSearchContext.query}
          </p>
          {providerOrder.length > 0 ? (
            <p className={studioSubtleText}>
              Preferred providers:{" "}
              {providerOrder.map((providerId) => formatProviderDisplayName(providerId)).join(" → ")}
            </p>
          ) : null}
        </div>

        <button type="button" className={`${studioActionButton} shrink-0`} onClick={onSearchAssets}>
          <Search className="h-4 w-4" aria-hidden />
          Search Assets
        </button>
      </div>
    </section>
  );
}
