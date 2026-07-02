"use client";

import { SearchX, ShieldOff, WifiOff } from "lucide-react";

import type { AssetBrowserEmptyStateKind } from "./asset-browser.types";
import { studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface AssetBrowserEmptyStateProps {
  kind: AssetBrowserEmptyStateKind;
  message?: string;
}

function resolveCopy(kind: AssetBrowserEmptyStateKind, message?: string) {
  switch (kind) {
    case "search_disabled":
      return {
        title: "Asset search is disabled",
        description:
          message ??
          "Enable ASSET_SEARCH_ENABLED to browse assets from connected providers.",
        icon: ShieldOff,
      };
    case "provider_unavailable":
      return {
        title: "Providers unavailable",
        description:
          message ??
          "Search providers could not return results. Try again or adjust your query.",
        icon: WifiOff,
      };
    case "missing_query":
      return {
        title: "Enter a search query",
        description: "Type a query above to browse normalized asset results.",
        icon: SearchX,
      };
    default:
      return {
        title: "No results found",
        description:
          message ?? "Try a different query or loosen your filters to see more assets.",
        icon: SearchX,
      };
  }
}

export default function AssetBrowserEmptyState({ kind, message }: AssetBrowserEmptyStateProps) {
  const copy = resolveCopy(kind, message);
  const Icon = copy.icon;

  return (
    <section className="flex flex-col items-center justify-center rounded-2xl bg-surface-elevated/20 px-6 py-12 text-center ring-1 ring-border/15">
      <Icon className="mb-3 h-8 w-8 text-muted" aria-hidden />
      <p className={studioShellSectionTitle}>{copy.title}</p>
      <p className={`${studioSubtleText} mt-2 max-w-md`}>{copy.description}</p>
    </section>
  );
}
