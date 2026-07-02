"use client";

import type { NormalizedAssetResult } from "@/features/asset-search/orchestrator";

import AssetBrowserCard from "./AssetBrowserCard";

export interface AssetBrowserGridProps {
  assets: NormalizedAssetResult[];
  onViewDetails: (asset: NormalizedAssetResult) => void;
}

export default function AssetBrowserGrid({ assets, onViewDetails }: AssetBrowserGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {assets.map((asset) => (
        <AssetBrowserCard key={asset.id} asset={asset} onViewDetails={() => onViewDetails(asset)} />
      ))}
    </div>
  );
}
