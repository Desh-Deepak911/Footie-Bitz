"use client";

import { AlertTriangle, Loader2, Search } from "lucide-react";

import {
  dedupeFriendlyWarnings,
  detectResearchSeasonLabel,
  detectResearchTags,
  formatResearchDetectedLabel,
  researchPreviewConfidenceTone,
  researchPreviewDisplayStatusTone,
  resolveResearchPreviewConfidence,
  resolveResearchPreviewDisplayStatus,
  resolveResearchPreviewSourceDetail,
  resolveResearchPreviewSourceLabel,
  selectResearchPreviewFacts,
} from "@/features/create/utils/research-preview-display.utils";
import {
  NO_RELIABLE_FOOTBALL_DATA_WARNING,
  shouldShowNoReliableDataWarning,
} from "@/features/research/utils/research-grounding.utils";
import type { ResearchPreviewState } from "@/features/create/types/research-preview.types";
import {
  studioComposerHelper,
  studioFieldLabel,
  studioGhostButton,
  studioPanel,
  studioSecondaryButton,
  studioSubtleText,
} from "@/lib/studioUi";
import type { ScriptMode } from "@/types/footiebitz";

interface ResearchPreviewPanelProps {
  enableResearch: boolean;
  topic: string;
  scriptMode: ScriptMode;
  preview: ResearchPreviewState;
  disabled: boolean;
  onPreviewResearch: () => void;
  /** Nested inside Smart Research step — lighter chrome, no section divider. */
  embedded?: boolean;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
      <dt className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-foreground/90 sm:text-right">{value}</dd>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${tone}`}
    >
      {label}
    </span>
  );
}

export default function ResearchPreviewPanel({
  enableResearch,
  topic,
  preview,
  disabled,
  onPreviewResearch,
  embedded = false,
}: ResearchPreviewPanelProps) {
  const context = preview.researchContext;
  const displayStatus = resolveResearchPreviewDisplayStatus(preview, context);
  const confidence = context ? resolveResearchPreviewConfidence(context) : null;
  const sourceLabel = context ? resolveResearchPreviewSourceLabel(context) : null;
  const sourceDetail = context ? resolveResearchPreviewSourceDetail(context) : null;
  const detectedTags = context ? detectResearchTags(context) : [];
  const seasonLabel = context ? detectResearchSeasonLabel(context) : undefined;
  const keyFacts = context ? selectResearchPreviewFacts(context) : [];
  const rankedPlayers = (context?.players ?? []).filter((player) => player.name.trim().length > 0);
  const hasRankings = rankedPlayers.some((player) => player.goals != null);
  const friendlyWarnings = context ? dedupeFriendlyWarnings(context.warnings) : [];
  const showNoReliableDataWarning = context ? shouldShowNoReliableDataWarning(context) : false;
  const previewDisabled = disabled || !enableResearch || !topic.trim() || preview.status === "loading";
  const showResultPanel =
    context && preview.status !== "idle" && preview.status !== "loading";

  return (
    <div className={embedded ? "mt-3" : "mt-4 border-t border-border/50 pt-4"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={embedded ? studioSubtleText : studioFieldLabel}>
            {embedded ? "Preview research" : "Research Preview"}
          </p>
          {!embedded ? (
            <p className={`${studioComposerHelper} mt-1`}>
              See whether your story will be grounded before you write.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onPreviewResearch}
          disabled={previewDisabled}
          className={`${studioSecondaryButton} w-full shrink-0 sm:w-auto`}
        >
          {preview.status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Looking up...
            </>
          ) : (
            <Search className="h-4 w-4" strokeWidth={1.75} />
          )}
          Research Preview
        </button>
      </div>

      {!enableResearch ? (
        <p className={`${studioComposerHelper} mt-3 rounded-xl bg-surface-elevated/30 px-3 py-2.5 ring-1 ring-border/20`}>
          Enable Smart Research to look up supporting details for your topic.
        </p>
      ) : null}

      {enableResearch && !topic.trim() ? (
        <p className={`${studioComposerHelper} mt-3 rounded-xl bg-surface-elevated/30 px-3 py-2.5 ring-1 ring-border/20`}>
          Add a topic above to preview research for your story.
        </p>
      ) : null}

      {enableResearch && topic.trim() && preview.status === "idle" ? (
        <div className={`${studioPanel} mt-3 flex flex-wrap items-center gap-2 px-3.5 py-3 sm:px-4`}>
          <StatusBadge label="Idle" tone={researchPreviewDisplayStatusTone("Idle")} />
          <p className={`${studioSubtleText} min-w-0 flex-1 basis-full sm:basis-auto`}>
            Run a research preview to see what details are available for this topic.
          </p>
        </div>
      ) : null}

      {preview.status === "error" && preview.errorMessage ? (
        <div className={`${studioPanel} mt-3 space-y-2 px-3.5 py-3 sm:px-4`}>
          <StatusBadge label="Unavailable" tone={researchPreviewDisplayStatusTone("Unavailable")} />
          <p className="text-sm leading-relaxed text-red-300/90">{preview.errorMessage}</p>
        </div>
      ) : null}

      {preview.status === "loading" ? (
        <div className={`${studioPanel} mt-3 space-y-2 px-3.5 py-3 sm:px-4`}>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label="Searching" tone={researchPreviewDisplayStatusTone("Searching")} />
            <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          </div>
          <p className={`${studioSubtleText} text-sm`}>Looking up supporting details...</p>
        </div>
      ) : null}

      {showResultPanel ? (
        <div className={`${studioPanel} mt-3 space-y-4 p-3.5 sm:p-4`}>
          <div>
            <p className="text-sm font-medium text-foreground/90">Research Summary</p>
            <p className={`${studioSubtleText} mt-1`}>
              {displayStatus === "Ready"
                ? "Good news — verified details are available for your story."
                : displayStatus === "Limited"
                  ? "Some details are limited — your story will stay cautious."
                  : "Research isn't available for this topic right now."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={displayStatus}
              tone={researchPreviewDisplayStatusTone(displayStatus)}
            />
            {confidence ? (
              <StatusBadge
                label={`Confidence: ${confidence}`}
                tone={researchPreviewConfidenceTone(confidence)}
              />
            ) : null}
            {sourceLabel ? (
              <StatusBadge
                label={`Source: ${sourceLabel}`}
                tone="bg-surface-elevated/50 text-muted ring-border/25"
              />
            ) : null}
          </div>

          {sourceDetail ? (
            <p className={`${studioSubtleText} text-xs`}>{sourceDetail}</p>
          ) : null}

          {showNoReliableDataWarning ? (
            <div className="rounded-xl bg-amber-950/25 px-3 py-2.5 ring-1 ring-amber-500/25">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm font-medium leading-relaxed text-amber-100">
                  {NO_RELIABLE_FOOTBALL_DATA_WARNING}
                </p>
              </div>
            </div>
          ) : null}

          <dl className="space-y-2.5 rounded-xl bg-surface-elevated/20 px-3 py-3 ring-1 ring-border/15">
            <MetaRow label="Research status" value={displayStatus} />
            {confidence ? <MetaRow label="Confidence" value={confidence} /> : null}
            {sourceLabel ? <MetaRow label="Source" value={sourceLabel} /> : null}
            <MetaRow
              label="Detected"
              value={detectedTags.map((tag) => formatResearchDetectedLabel(tag)).join(" · ")}
            />
            {seasonLabel ? <MetaRow label="Year/season" value={seasonLabel} /> : null}
          </dl>

          {context.summary && !showNoReliableDataWarning ? (
            <p className="text-sm leading-relaxed text-foreground/85">{context.summary}</p>
          ) : null}

          {keyFacts.length > 0 ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Key facts</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground/90">
                {keyFacts.map((fact) => (
                  <li key={fact} className="flex gap-2">
                    <span className="text-muted">·</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasRankings ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Rankings</p>
              <ol className="mt-2 divide-y divide-border/15 rounded-xl bg-surface-elevated/20 ring-1 ring-border/15">
                {rankedPlayers.slice(0, 6).map((player, index) => (
                  <li
                    key={`${player.id}-${player.name}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/90"
                  >
                    <span className="w-5 shrink-0 font-medium tabular-nums text-muted">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{player.name}</span>
                    {player.goals != null ? (
                      <span className="shrink-0 text-xs tabular-nums text-muted">{player.goals}G</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {context.standings?.length ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Standings</p>
              <div className="mt-2 space-y-3">
                {context.standings.map((table) => (
                  <div
                    key={`${table.league}-${table.season}`}
                    className="rounded-xl bg-surface-elevated/20 px-3 py-2.5 ring-1 ring-border/15"
                  >
                    <p className="text-xs font-medium text-foreground/80">
                      {table.league} · {table.season}
                    </p>
                    <ol className="mt-1.5 space-y-1 text-sm text-foreground/90">
                      {table.rows.slice(0, 5).map((row) => (
                        <li key={`${table.league}-${row.rank}-${row.team}`} className="flex justify-between gap-2">
                          <span>
                            {row.rank}. {row.team}
                          </span>
                          <span className="shrink-0 tabular-nums text-muted">{row.points} pts</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {friendlyWarnings.length > 0 ? (
            <div className="rounded-xl bg-amber-950/20 px-3 py-2.5 ring-1 ring-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-xs font-medium text-amber-200">Heads up</p>
                  <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-amber-100/90">
                    {friendlyWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {preview.contextText ? (
            <details className="group">
              <summary className={`${studioGhostButton} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
                View details
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-elevated/35 px-3 py-2.5 text-xs leading-relaxed text-foreground/85 ring-1 ring-border/20">
                {preview.contextText}
              </pre>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
