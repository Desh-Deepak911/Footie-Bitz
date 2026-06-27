"use client";

import { AlertTriangle, Loader2, Search } from "lucide-react";

import {
  formatRankingIntentSummary,
  formatResearchEntityLabel,
  formatResearchSourceLabel,
  detectResearchEntity,
} from "@/features/create/utils/research-preview.utils";
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
} from "@/lib/studioUi";
import { SCRIPT_MODE_OPTIONS } from "@/types/footiebitz";
import type { ScriptMode } from "@/types/footiebitz";

interface ResearchPreviewPanelProps {
  enableResearch: boolean;
  topic: string;
  scriptMode: ScriptMode;
  preview: ResearchPreviewState;
  disabled: boolean;
  onPreviewResearch: () => void;
}

function statusLabel(status: ResearchPreviewState["status"]): string {
  switch (status) {
    case "idle":
      return "Idle";
    case "loading":
      return "Loading";
    case "success":
      return "Success";
    case "fallback":
      return "Fallback";
    case "error":
      return "Error";
  }
}

function statusTone(status: ResearchPreviewState["status"]): string {
  switch (status) {
    case "success":
      return "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20";
    case "fallback":
      return "bg-amber-500/10 text-amber-300 ring-amber-500/20";
    case "error":
      return "bg-red-500/10 text-red-300 ring-red-500/20";
    case "loading":
      return "bg-accent/10 text-accent ring-accent/20";
    default:
      return "bg-surface-elevated/50 text-muted ring-border/25";
  }
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-foreground/90">{value}</dd>
    </div>
  );
}

export default function ResearchPreviewPanel({
  enableResearch,
  topic,
  scriptMode,
  preview,
  disabled,
  onPreviewResearch,
}: ResearchPreviewPanelProps) {
  const modeLabel =
    SCRIPT_MODE_OPTIONS.find((option) => option.value === scriptMode)?.label ?? scriptMode;
  const context = preview.researchContext;
  const entity = context ? detectResearchEntity(context) : null;
  const rankingSummary = context ? formatRankingIntentSummary(context) : undefined;
  const rankedPlayers = (context?.players ?? []).filter((player) => player.name.trim().length > 0);
  const hasRankings = rankedPlayers.some((player) => player.goals != null);
  const facts = context?.facts.filter((fact) => fact.trim().length > 0) ?? [];
  const warnings = context?.warnings.filter((warning) => warning.trim().length > 0) ?? [];
  const showNoReliableDataWarning = context ? shouldShowNoReliableDataWarning(context) : false;
  const previewDisabled = disabled || !enableResearch || !topic.trim() || preview.status === "loading";

  return (
    <div className="mt-4 border-t border-border/50 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={studioFieldLabel}>Research Preview</p>
          <p className={`${studioComposerHelper} mt-1`}>
            See supporting information before you write.
          </p>
        </div>
        <button
          type="button"
          onClick={onPreviewResearch}
          disabled={previewDisabled}
          className={`${studioSecondaryButton} w-full shrink-0 sm:w-auto`}
        >
          {preview.status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" strokeWidth={1.75} />
          )}
          Research Preview
        </button>
      </div>

      {!enableResearch ? (
        <p className={`${studioComposerHelper} mt-3 rounded-xl bg-surface-elevated/30 px-3 py-2.5 ring-1 ring-border/20`}>
          Enable Smart Research to gather supporting information.
        </p>
      ) : null}

      {enableResearch && !topic.trim() ? (
        <p className={`${studioComposerHelper} mt-3 rounded-xl bg-surface-elevated/30 px-3 py-2.5 ring-1 ring-border/20`}>
          Add a topic to preview supporting information.
        </p>
      ) : null}

      {preview.status === "error" && preview.errorMessage ? (
        <div className="mt-3 rounded-xl bg-red-950/20 px-3 py-2.5 text-sm text-red-300 ring-1 ring-red-500/20">
          {preview.errorMessage}
        </div>
      ) : null}

      {context && preview.status !== "idle" && preview.status !== "loading" ? (
        <div className={`${studioPanel} mt-3 space-y-4 p-3.5 sm:p-4`}>
          <p className="text-sm font-medium text-foreground/90">Research Summary</p>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${statusTone(preview.status)}`}
            >
              {statusLabel(preview.status)}
            </span>
            <span className="inline-flex items-center rounded-full bg-surface-elevated/50 px-2.5 py-1 text-[11px] font-medium text-muted ring-1 ring-border/25">
              Source: {formatResearchSourceLabel(context.source)}
            </span>
          </div>

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

          <dl className="space-y-2.5">
            <MetaRow label="Detected mode" value={modeLabel} />
            <MetaRow label="Detected entity" value={formatResearchEntityLabel(entity ?? "unknown")} />
            {rankingSummary ? <MetaRow label="Ranking intent" value={rankingSummary} /> : null}
            {context.summary ? <MetaRow label="Summary" value={context.summary} /> : null}
          </dl>

          {facts.length > 0 ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Key facts</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground/90">
                {facts.map((fact) => (
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
              <ol className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground/90">
                {rankedPlayers.map((player, index) => (
                  <li key={`${player.id}-${player.name}`} className="flex flex-wrap gap-x-2 gap-y-0.5">
                    <span className="font-medium tabular-nums text-muted">{index + 1}.</span>
                    <span>{player.name}</span>
                    {player.team ? <span className="text-muted">· {player.team}</span> : null}
                    {player.nationality && !player.team ? (
                      <span className="text-muted">· {player.nationality}</span>
                    ) : null}
                    {player.goals != null ? (
                      <span className="text-muted">· {player.goals} goals</span>
                    ) : null}
                    {player.appearances != null ? (
                      <span className="text-muted">· {player.appearances} apps</span>
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
                  <div key={`${table.league}-${table.season}`}>
                    <p className="text-xs font-medium text-foreground/80">
                      {table.league} · {table.season}
                    </p>
                    <ol className="mt-1.5 space-y-1 text-sm text-foreground/90">
                      {table.rows.slice(0, 5).map((row) => (
                        <li key={`${table.league}-${row.rank}-${row.team}`}>
                          {row.rank}. {row.team} — {row.points} pts
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="rounded-xl bg-amber-950/20 px-3 py-2.5 ring-1 ring-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <p className="text-xs font-medium text-amber-200">Warnings</p>
                  <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-amber-100/90">
                    {warnings.map((warning) => (
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
                Full research details
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-elevated/35 px-3 py-2.5 text-xs leading-relaxed text-foreground/85 ring-1 ring-border/20">
                {preview.contextText}
              </pre>
            </details>
          ) : null}
        </div>
      ) : null}

      {preview.status === "loading" ? (
        <div className={`${studioPanel} mt-3 flex items-center gap-2 px-3.5 py-3 text-sm text-muted sm:px-4`}>
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Gathering supporting information…
        </div>
      ) : null}
    </div>
  );
}
