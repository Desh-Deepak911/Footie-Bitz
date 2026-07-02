"use client";

import type { NormalizedAssetResult } from "@/features/asset-search/orchestrator";

import {
  formatDimensions,
  formatLicenseBadgeLabel,
  formatOrientationLabel,
  formatProviderDisplayName,
  formatScoreLabel,
} from "./asset-browser.utils";
import { studioBadge, studioCompactButton, studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface AssetBrowserCardProps {
  asset: NormalizedAssetResult;
  onViewDetails: () => void;
}

export default function AssetBrowserCard({ asset, onViewDetails }: AssetBrowserCardProps) {
  const dimensions = formatDimensions(asset);

  return (
    <article className="group overflow-hidden rounded-2xl bg-surface-elevated/25 ring-1 ring-border/20 transition hover:-translate-y-0.5 hover:ring-border/35 motion-reduce:transform-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-background/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.thumbnailUrl}
          alt={asset.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
          loading="lazy"
        />

        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="flex w-full items-end justify-between gap-2">
            <p className="line-clamp-2 text-xs text-white/90">{asset.previewUrl}</p>
            <button type="button" onClick={onViewDetails} className={`${studioCompactButton} shrink-0 bg-black/40 text-white ring-white/20 hover:bg-black/55`}>
              View Details
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3.5">
        <div className="space-y-1">
          <p className={`${studioShellSectionTitle} line-clamp-2 text-sm`}>{asset.title}</p>
          <p className={`${studioSubtleText} line-clamp-1`}>
            {formatProviderDisplayName(asset.providerId)} · {asset.attribution.creatorName ?? "Unknown creator"}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className={studioBadge}>{formatLicenseBadgeLabel(asset.license.licenseType)}</span>
          {asset.orientation ? (
            <span className={studioBadge}>{formatOrientationLabel(asset.orientation)}</span>
          ) : null}
          {dimensions ? <span className={studioBadge}>{dimensions}</span> : null}
          <span className={studioBadge}>{formatScoreLabel(asset.score)}</span>
        </div>

        <button type="button" onClick={onViewDetails} className={`${studioCompactButton} w-full`}>
          View Details
        </button>
      </div>
    </article>
  );
}
