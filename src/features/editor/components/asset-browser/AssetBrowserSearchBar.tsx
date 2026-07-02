"use client";

import { Search } from "lucide-react";

import { studioInput, studioShellSectionTitle, studioSubtleText } from "@/lib/utils/studioUi";

export interface AssetBrowserSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  disabled?: boolean;
}

export default function AssetBrowserSearchBar({
  query,
  onQueryChange,
  disabled = false,
}: AssetBrowserSearchBarProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <div>
          <p className={studioShellSectionTitle}>Search Assets</p>
          <p className={studioSubtleText}>Browse normalized results from the asset search platform</p>
        </div>
      </div>

      <input
        type="search"
        value={query}
        disabled={disabled}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search photos and visuals…"
        aria-label="Asset search query"
        className={studioInput}
      />
    </section>
  );
}
