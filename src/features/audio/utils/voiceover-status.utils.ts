import { getStoryVoiceSettings, normalizeStoryVoiceSettings } from "@/features/story/utils";
import type { FootieScript } from "@/features/story/types";

import {
  getCanonicalVoiceover,
  getVoiceoverAvailability,
} from "./canonical-voiceover.utils";
import {
  resolvePlayableVoiceoverFromStory,
  VOICEOVER_UNPLAYABLE_MESSAGE,
} from "./playable-voiceover-src.utils";
import { formatDisplayDurationMs } from "@/lib/utils/formatDisplayDuration.utils";

export type EditorVoiceoverStatusKind =
  | "missing"
  | "ready"
  | "stale"
  | "persisting"
  | "regenerating"
  | "unplayable";

export interface EditorVoiceoverStatus {
  kind: EditorVoiceoverStatusKind;
  label: string;
  detail: string;
  playbackUrl?: string;
  durationMs?: number;
  hasPlayableAudio: boolean;
}

function normalizeNarrationText(value: string | undefined): string {
  return value?.trim() ?? "";
}

/** True when narration text drifted from the voiceover snapshot (script-level only). */
export function hasNarrationTextVoiceoverMismatch(story: FootieScript): boolean {
  const availability = getVoiceoverAvailability(story);
  if (!availability.hasCanonicalVoiceover) {
    return false;
  }

  const currentNarration = normalizeNarrationText(story.narration);
  if (!currentNarration) {
    return false;
  }

  const snapshotNarration = normalizeNarrationText(story.voiceoverNarration);
  if (!snapshotNarration) {
    return true;
  }

  return currentNarration !== snapshotNarration;
}

/** True when voice or speed changed since voiceover was last generated. */
export function hasVoiceSettingsVoiceoverMismatch(story: FootieScript): boolean {
  const availability = getVoiceoverAvailability(story);
  if (!availability.hasCanonicalVoiceover) {
    return false;
  }

  const snapshot = story.voiceoverVoiceSettings;
  if (!snapshot) {
    return false;
  }

  const current = getStoryVoiceSettings(story);
  const normalizedSnapshot = normalizeStoryVoiceSettings({ voiceSettings: snapshot });

  return (
    current.voice !== normalizedSnapshot.voice ||
    current.speed !== normalizedSnapshot.speed
  );
}

/** Editor stale reasons — narration text or voice settings only (not scene/image/timeline edits). */
export function hasEditorVoiceoverStaleReasons(story: FootieScript): boolean {
  return (
    hasNarrationTextVoiceoverMismatch(story) ||
    hasVoiceSettingsVoiceoverMismatch(story)
  );
}

function resolveStaleDetail(story: FootieScript): string {
  const narrationDrift = hasNarrationTextVoiceoverMismatch(story);
  const voiceDrift = hasVoiceSettingsVoiceoverMismatch(story);

  if (narrationDrift && voiceDrift) {
    return "Narration text and voice settings changed since this audio was recorded.";
  }

  if (narrationDrift) {
    return "Narration text changed since this audio was recorded.";
  }

  if (voiceDrift) {
    return "Voice or speed changed since this audio was recorded.";
  }

  return "Voiceover needs to be regenerated.";
}

export function resolveEditorVoiceoverStatus(
  script: FootieScript,
  options?: {
    isRegenerating?: boolean;
    isPersisting?: boolean;
  },
): EditorVoiceoverStatus {
  const isRegenerating = Boolean(options?.isRegenerating);
  const isPersisting = Boolean(options?.isPersisting);
  const availability = getVoiceoverAvailability(script);
  const playable = resolvePlayableVoiceoverFromStory(script, { preferObjectUrl: true });
  const voiceover = getCanonicalVoiceover(script);
  const playbackUrl = playable.src ?? voiceover?.url;
  const durationMs = playable.durationMs ?? voiceover?.durationMs ?? script.voiceoverDurationMs;
  const hasPlayableAudio = playable.hasPlayableSrc;

  if (isRegenerating) {
    return {
      kind: "regenerating",
      label: "Generating voiceover",
      detail: "Recording narration from your script…",
      playbackUrl,
      durationMs,
      hasPlayableAudio,
    };
  }

  if (isPersisting) {
    return {
      kind: "persisting",
      label: "Saving audio",
      detail: "Persisting voiceover to your draft…",
      playbackUrl,
      durationMs,
      hasPlayableAudio,
    };
  }

  if (!availability.hasCanonicalVoiceover) {
    return {
      kind: "missing",
      label: "Missing",
      detail: "No voiceover yet. Generate narration to preview and export with audio.",
      hasPlayableAudio: false,
    };
  }

  if (!hasPlayableAudio) {
    return {
      kind: "unplayable",
      label: "Cannot load",
      detail: VOICEOVER_UNPLAYABLE_MESSAGE,
      hasPlayableAudio: false,
    };
  }

  if (hasEditorVoiceoverStaleReasons(script)) {
    return {
      kind: "stale",
      label: "Needs regeneration",
      detail: resolveStaleDetail(script),
      playbackUrl,
      durationMs,
      hasPlayableAudio,
    };
  }

  const durationLabel =
    durationMs != null && durationMs > 0
      ? `${formatDisplayDurationMs(durationMs)} recorded`
      : "Ready for preview and export";

  return {
    kind: "ready",
    label: "Ready",
    detail: durationLabel,
    playbackUrl,
    durationMs,
    hasPlayableAudio,
  };
}
