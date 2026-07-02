"use client";

export interface AssetBrowserLoadingProps {
  count?: number;
}

export default function AssetBrowserLoading({ count = 6 }: AssetBrowserLoadingProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading assets">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl bg-surface-elevated/25 ring-1 ring-border/15"
        >
          <div className="aspect-[4/3] animate-pulse bg-surface-elevated/60" />
          <div className="space-y-2 p-3.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-elevated/60" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-elevated/50" />
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-surface-elevated/50" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-surface-elevated/50" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
