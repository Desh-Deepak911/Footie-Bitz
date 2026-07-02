"use client";

import { Check, Copy, Search } from "lucide-react";
import { useCallback, useState } from "react";

import CreatorAssetStudioToast from "@/features/editor/components/creator-asset-studio/CreatorAssetStudioToast";
import { useCreatorAssetStudioCompact } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.compact-context";
import {
  copyPlanningText,
  resolveCreatorAssetSectionClass,
} from "@/features/editor/components/creator-asset-studio/creator-asset-studio.utils";
import {
  studioCompactButton,
  studioShellSectionTitle,
  studioSubtleText,
} from "@/lib/utils/studioUi";

export interface CreatorAssetSearchQueryProps {
  searchQuery: string;
}

/**
 * Read-only search query display with monospace styling and copy feedback.
 */
export default function CreatorAssetSearchQuery({ searchQuery }: CreatorAssetSearchQueryProps) {
  const compact = useCreatorAssetStudioCompact();
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleCopyQuery = useCallback(async () => {
    const success = await copyPlanningText(searchQuery);
    if (!success) {
      return;
    }

    setCopied(true);
    setToastVisible(true);
    window.setTimeout(() => {
      setCopied(false);
      setToastVisible(false);
    }, 1800);
  }, [searchQuery]);

  return (
    <>
      <section className={`${resolveCreatorAssetSectionClass(compact)} ${compact ? "" : "transition hover:ring-border/25"}`}>
        <header className={`flex items-center gap-2 ${compact ? "mb-2" : "mb-3 gap-2.5"}`}>
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <div>
            <p className={studioShellSectionTitle}>Search Query</p>
            <p className={studioSubtleText}>Read-only planning query — copy for manual lookup</p>
          </div>
        </header>

        <div className="flex flex-col gap-2">
          <div
            aria-label="Recommended asset search query"
            className={`min-h-[2.25rem] w-full overflow-x-auto rounded-md bg-background/35 font-mono leading-relaxed text-foreground/95 ring-1 ring-border/20 ${
              compact ? "px-2 py-1.5 text-[11px]" : "min-h-[2.75rem] rounded-xl px-3.5 py-2.5 text-[12px]"
            }`}
          >
            {searchQuery.trim() || "No search query available."}
          </div>

          <button
            type="button"
            onClick={handleCopyQuery}
            disabled={!searchQuery.trim()}
            aria-label={copied ? "Search query copied" : "Copy search query"}
            className={`${studioCompactButton} w-full`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </section>

      <CreatorAssetStudioToast message="Search query copied" visible={toastVisible} />
    </>
  );
}
