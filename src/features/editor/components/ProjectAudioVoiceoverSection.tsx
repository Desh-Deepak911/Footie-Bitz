"use client";

import { ChevronDown, Loader2, Mic, RefreshCw, Upload } from "lucide-react";
import { useId, useRef } from "react";
import { useSyncExternalStore } from "react";

import { resolveEditorVoiceoverStatus } from "@/features/audio/utils/voiceover-status.utils";
import { formatDisplayDurationMs } from "@/lib/utils/formatDisplayDuration.utils";
import {
  getDraftSessionSnapshot,
  subscribeDraftSessionStore,
} from "@/features/drafts/session/draft-session-store";
import { useStoryDocument } from "@/features/drafts/store";
import { getStoryVoiceSettings } from "@/features/story/utils";
import type { FootieScript } from "@/features/story/types";
import { useStoryVoiceoverApply } from "@/hooks/useStoryVoiceoverApply";
import { useStoryVoiceoverUpload } from "@/hooks/useStoryVoiceoverUpload";
import { applyStoryVoiceSettings } from "@/lib/utils/voiceover";
import {
  DEFAULT_VOICEOVER_VOICE,
  VOICEOVER_SPEED_OPTIONS,
  VOICEOVER_VOICE_OPTIONS,
  VOICE_SPEED_LABELS,
  type VoiceoverSpeedOption,
  type VoiceoverVoiceOption,
} from "@/lib/utils/voiceoverOptions";
import {
  studioBadge,
  studioChip,
  studioChipActive,
  studioCompactButton,
  studioError,
  studioFieldLabel,
  studioPrimaryButton,
  studioSelect,
  studioSelectChevron,
  studioSubtleText,
  studioWarningPanel,
} from "@/lib/utils/studioUi";

export interface ProjectAudioVoiceoverSectionProps {
  script: FootieScript;
  onScriptChange: (script: FootieScript) => void;
}

const STATUS_BADGE_CLASS: Record<
  ReturnType<typeof resolveEditorVoiceoverStatus>["kind"],
  string
> = {
  ready: "text-accent ring-accent/25",
  missing: "text-muted ring-border/25",
  stale: "text-amber-200 ring-amber-500/25",
  persisting: "text-sky-200 ring-sky-500/25",
  regenerating: "text-sky-200 ring-sky-500/25",
  unplayable: "text-rose-200 ring-rose-500/25",
};

const ACCEPTED_AUDIO_TYPES =
  "audio/*,.mp3,.wav,.m4a,.aac,.ogg,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg";

function resolvePrimaryCtaLabel(
  kind: ReturnType<typeof resolveEditorVoiceoverStatus>["kind"],
): string {
  if (kind === "missing") {
    return "Generate voiceover";
  }

  return "Regenerate voiceover";
}

/**
 * Single flat voiceover surface for Project Audio Studio — status, voice/speed, duration, and CTAs.
 */
export default function ProjectAudioVoiceoverSection({
  script,
  onScriptChange,
}: ProjectAudioVoiceoverSectionProps) {
  const uploadInputId = useId();
  const voiceSelectId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { draftId } = useStoryDocument();
  const persistStatus = useSyncExternalStore(
    subscribeDraftSessionStore,
    () => getDraftSessionSnapshot(draftId ?? "").persistStatus,
    () => "idle" as const,
  );
  const {
    applyVoiceoverChanges,
    loading: regenerateLoading,
    error: regenerateError,
  } = useStoryVoiceoverApply(script, onScriptChange);
  const {
    applyUploadedVoiceover,
    loading: uploadLoading,
    error: uploadError,
  } = useStoryVoiceoverUpload(script, onScriptChange);

  const status = resolveEditorVoiceoverStatus(script, {
    isRegenerating: regenerateLoading,
    isPersisting: persistStatus === "pending",
  });
  const voiceSettings = getStoryVoiceSettings(script);
  const selectedVoice = (voiceSettings.voice ?? DEFAULT_VOICEOVER_VOICE) as VoiceoverVoiceOption;
  const selectedSpeed = voiceSettings.speed;
  const hasNarration = script.narration.trim().length > 0;
  const isBusy = regenerateLoading || uploadLoading || persistStatus === "pending";
  const durationLabel =
    status.durationMs != null && status.durationMs > 0
      ? formatDisplayDurationMs(status.durationMs)
      : "—";
  const primaryCtaLabel = resolvePrimaryCtaLabel(status.kind);
  const usePrimaryStyle =
    status.kind === "missing" || status.kind === "unplayable" || status.kind === "stale";
  const error = regenerateError ?? uploadError;

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    void applyUploadedVoiceover(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className={studioFieldLabel}>Status</p>
        <span
          className={`${studioBadge} shrink-0 ${STATUS_BADGE_CLASS[status.kind]}`}
          role="status"
          aria-live="polite"
        >
          {status.kind === "regenerating" || status.kind === "persisting" ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : (
            <Mic className="h-3 w-3" aria-hidden />
          )}
          {status.label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 text-[11px]">
        <p className={studioFieldLabel}>Duration</p>
        <p className="text-foreground/90 tabular-nums">{durationLabel}</p>
      </div>

      <div className="space-y-2 border-t border-border/15 pt-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={voiceSelectId} className={`${studioFieldLabel} shrink-0`}>
            Voice
          </label>
          <div className="relative min-w-0 flex-1 max-w-[11rem]">
            <select
              id={voiceSelectId}
              value={selectedVoice}
              onChange={(event) =>
                onScriptChange(
                  applyStoryVoiceSettings(script, {
                    voice: event.target.value,
                  }),
                )
              }
              disabled={isBusy}
              className={`${studioSelect} capitalize py-1.5 text-xs`}
            >
              {VOICEOVER_VOICE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className={studioSelectChevron} />
          </div>
        </div>

        <div>
          <p className={studioFieldLabel}>Speed</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {VOICEOVER_SPEED_OPTIONS.map((option) => {
              const active = selectedSpeed === option;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={isBusy}
                  onClick={() =>
                    onScriptChange(
                      applyStoryVoiceSettings(script, {
                        speed: option as VoiceoverSpeedOption,
                      }),
                    )
                  }
                  className={`${active ? studioChipActive : studioChip} justify-center px-1.5 py-1.5 text-[10px]`}
                >
                  {VOICE_SPEED_LABELS[option]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {status.kind === "stale" ? (
        <div className={`${studioWarningPanel} px-2.5 py-2`}>
          <p className="text-[11px] leading-relaxed">{status.detail}</p>
        </div>
      ) : null}

      {status.kind === "unplayable" ? (
        <p className={`${studioSubtleText} text-[11px] leading-relaxed`}>{status.detail}</p>
      ) : null}

      {status.hasPlayableAudio ? (
        <p className={`${studioSubtleText} text-[11px] leading-relaxed`}>
          Use the canvas Play button to preview voiceover with video.
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5 border-t border-border/15 pt-3">
        <button
          type="button"
          onClick={() => void applyVoiceoverChanges()}
          disabled={isBusy || !hasNarration}
          className={`${usePrimaryStyle ? studioPrimaryButton : studioCompactButton} w-full justify-center`}
        >
          {regenerateLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {status.kind === "missing" ? "Generating voiceover…" : "Regenerating…"}
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              {primaryCtaLabel}
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          id={uploadInputId}
          type="file"
          accept={ACCEPTED_AUDIO_TYPES}
          className="sr-only"
          disabled={isBusy}
          onChange={handleUploadChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className={`${studioCompactButton} w-full justify-center`}
        >
          {uploadLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading voiceover…
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload voiceover
            </>
          )}
        </button>

        {!hasNarration ? (
          <p className={`${studioSubtleText} text-[11px] leading-relaxed`}>
            Add narration text in the project section below to generate TTS voiceover. You can still
            upload your own audio file.
          </p>
        ) : null}
      </div>

      {error ? (
        <div className={studioError} role="alert">
          <p className="text-xs font-medium leading-relaxed">Couldn&apos;t update voiceover</p>
          <p className="mt-1 text-xs leading-relaxed">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
