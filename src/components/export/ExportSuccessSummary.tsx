"use client";

import { CheckCircle2, ChevronDown, Download } from "lucide-react";

import { downloadBlob } from "@/features/export/utils/download.utils";
import { formatDisplayDurationSec } from "@/lib/utils/formatDisplayDuration.utils";
import {
  studioFieldLabel,
  studioPanel,
  studioPrimaryButton,
  studioSubtleText,
} from "@/lib/utils/studioUi";

export interface ExportSuccessSummaryProps {
  fileName: string;
  durationSec: number;
  resolution: string;
  voiceoverEnabled: boolean;
  backgroundMusicEnabled: boolean;
  diagnostics: string[];
  downloadBlob?: Blob | null;
  downloadFileName: string;
}

function EnabledLabel({ enabled }: { enabled: boolean }) {
  return (
    <span className={enabled ? "text-foreground/90" : "text-muted"}>{enabled ? "Yes" : "No"}</span>
  );
}

export default function ExportSuccessSummary({
  fileName,
  durationSec,
  resolution,
  voiceoverEnabled,
  backgroundMusicEnabled,
  diagnostics,
  downloadBlob: exportBlob,
  downloadFileName,
}: ExportSuccessSummaryProps) {
  const canDownloadAgain = Boolean(exportBlob);

  return (
    <div className={`${studioPanel} space-y-4`}>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Video exported successfully
            </p>
            <p className={`${studioSubtleText} mt-1 text-[11px]`}>
              Your file was saved to your downloads folder.
            </p>
          </div>

          <dl className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between gap-3">
              <dt className={studioFieldLabel}>Filename</dt>
              <dd className="truncate text-right text-foreground/90">{fileName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className={studioFieldLabel}>Duration</dt>
              <dd className="tabular-nums text-foreground/90">
                {formatDisplayDurationSec(durationSec)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className={studioFieldLabel}>Resolution</dt>
              <dd className="text-foreground/90">{resolution.replace("x", "×")}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className={studioFieldLabel}>Voiceover enabled</dt>
              <dd>
                <EnabledLabel enabled={voiceoverEnabled} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className={studioFieldLabel}>Background music enabled</dt>
              <dd>
                <EnabledLabel enabled={backgroundMusicEnabled} />
              </dd>
            </div>
          </dl>

          <button
            type="button"
            disabled={!canDownloadAgain}
            onClick={() => {
              if (exportBlob) {
                downloadBlob(exportBlob, downloadFileName);
              }
            }}
            className={`${studioPrimaryButton} w-full`}
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Download
          </button>
        </div>
      </div>

      {diagnostics.length > 0 ? (
        <details className="group rounded-xl bg-surface-elevated/20 ring-1 ring-border/15">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium text-muted [&::-webkit-details-marker]:hidden">
            <span>View export diagnostics</span>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="space-y-2 border-t border-border/15 px-3 py-2.5 text-[11px] leading-relaxed text-muted">
            {diagnostics.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
