"use client";

import { studioCompactButton, studioSubtleText } from "@/lib/utils/studioUi";

export interface AssetBrowserPaginationProps {
  page: number;
  limit: number;
  totalResults: number;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export default function AssetBrowserPagination({
  page,
  limit,
  totalResults,
  hasNextPage,
  onPrevious,
  onNext,
  disabled = false,
}: AssetBrowserPaginationProps) {
  const rangeStart = totalResults === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalResults);

  return (
    <div className="flex flex-col gap-3 border-t border-border/15 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className={studioSubtleText}>
        Showing {rangeStart}-{rangeEnd} of {totalResults} results
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={onPrevious}
          className={studioCompactButton}
        >
          Previous
        </button>
        <span className={`${studioSubtleText} min-w-[4rem] text-center tabular-nums`}>Page {page}</span>
        <button
          type="button"
          disabled={disabled || !hasNextPage}
          onClick={onNext}
          className={studioCompactButton}
        >
          Next
        </button>
      </div>
    </div>
  );
}
