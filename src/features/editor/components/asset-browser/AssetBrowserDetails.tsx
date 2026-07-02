"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import type { NormalizedAssetResult } from "@/features/asset-search/orchestrator";

import {
  formatDimensions,
  formatLicenseBadgeLabel,
  formatOrientationLabel,
  formatProviderDisplayName,
  formatScoreLabel,
} from "./asset-browser.utils";
import {
  studioBadge,
  studioCompactButton,
  studioPrimaryButton,
  studioShellSectionDesc,
  studioShellSectionTitle,
  studioSubtleText,
} from "@/lib/utils/studioUi";

import type { AssetBrowserAttachState } from "./asset-browser.types";

export interface AssetBrowserDetailsProps {
  asset: NormalizedAssetResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachEnabled?: boolean;
  attachState?: AssetBrowserAttachState;
  attachErrorMessage?: string;
  onAttach?: () => void;
}

export default function AssetBrowserDetails({
  asset,
  open,
  onOpenChange,
  attachEnabled = false,
  attachState = "idle",
  attachErrorMessage,
  onAttach,
}: AssetBrowserDetailsProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onOpenChange, open]);

  if (!open || !asset || typeof document === "undefined") {
    return null;
  }

  const dimensions = formatDimensions(asset);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close asset details"
        className="absolute inset-0 bg-black/55"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-browser-details-title"
        className="relative z-[81] flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-background ring-1 ring-border/25 sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/15 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 id="asset-browser-details-title" className={studioShellSectionTitle}>
              {asset.title}
            </h2>
            <p className={studioShellSectionDesc}>
              {attachEnabled
                ? "Review asset details, then attach to the selected scene."
                : "Read-only asset details."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={`${studioCompactButton} shrink-0`}
            aria-label="Close details"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto px-4 py-4 sm:px-5">
          <div className="overflow-hidden rounded-2xl bg-surface-elevated/20 ring-1 ring-border/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.previewUrl} alt={asset.title} className="max-h-[24rem] w-full object-contain" />
          </div>

          {asset.description ? (
            <p className={`${studioSubtleText} mt-4`}>{asset.description}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className={studioBadge}>{formatProviderDisplayName(asset.providerId)}</span>
            <span className={studioBadge}>{formatLicenseBadgeLabel(asset.license.licenseType)}</span>
            {asset.orientation ? (
              <span className={studioBadge}>{formatOrientationLabel(asset.orientation)}</span>
            ) : null}
            {dimensions ? <span className={studioBadge}>{dimensions}</span> : null}
            <span className={studioBadge}>{formatScoreLabel(asset.score)}</span>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className={studioSubtleText}>Creator</dt>
              <dd className="mt-1 text-foreground/90">{asset.attribution.creatorName ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className={studioSubtleText}>Provider</dt>
              <dd className="mt-1 text-foreground/90">{asset.attribution.providerName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={studioSubtleText}>Attribution</dt>
              <dd className="mt-1 text-foreground/90">{asset.attribution.requiredText}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={studioSubtleText}>Tags</dt>
              <dd className="mt-1 text-foreground/90">
                {asset.tags.length > 0 ? asset.tags.join(", ") : "None"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={studioSubtleText}>Preview URL</dt>
              <dd className="mt-1 break-all font-mono text-[12px] text-foreground/85">{asset.previewUrl}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={studioSubtleText}>Full resolution URL</dt>
              <dd className="mt-1 break-all font-mono text-[12px] text-foreground/85">
                {asset.fullResolutionUrl}
              </dd>
            </div>
          </dl>

          {attachEnabled ? (
            <div className="mt-6 space-y-2 border-t border-border/15 pt-4">
              {attachState === "loading" ? (
                <p className={studioSubtleText}>Preparing asset…</p>
              ) : null}
              {attachState === "success" ? (
                <p className="text-sm font-medium text-emerald-400/90">Attached to scene</p>
              ) : null}
              {attachState === "error" ? (
                <p className="text-sm text-red-400/90">
                  {attachErrorMessage ??
                    "We couldn't prepare this asset. Try another result or upload manually."}
                </p>
              ) : null}
              <button
                type="button"
                className={`${studioPrimaryButton} w-full sm:w-auto`}
                disabled={attachState === "loading" || attachState === "success"}
                onClick={onAttach}
              >
                Attach to Scene
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
