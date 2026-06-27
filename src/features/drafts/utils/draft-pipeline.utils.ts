import { getCanonicalVoiceover } from "@/features/audio";

import type { Draft, DraftPipelineStage, DraftWorkflowStatus } from "../types";

/** Script-only draft with no scenes yet. */
export function isScriptReviewDraft(draft: Pick<Draft, "pipelineStage" | "scenes">): boolean {
  if (draft.pipelineStage === "script_review") {
    return true;
  }

  if (draft.pipelineStage === "voiceover_ready" || draft.pipelineStage === "editor_ready") {
    return false;
  }

  return draft.scenes.length === 0;
}

/** Voiceover attached but storyboard not built yet. */
export function isVoiceoverReadyDraft(
  draft: Pick<Draft, "pipelineStage" | "scenes" | "script">,
): boolean {
  if (draft.pipelineStage === "voiceover_ready") {
    return true;
  }

  if (draft.pipelineStage === "editor_ready" || draft.pipelineStage === "script_review") {
    return false;
  }

  const hasVoiceover = Boolean(getCanonicalVoiceover(draft.script)?.url);
  return hasVoiceover && draft.scenes.length === 0;
}

/** Draft is ready for the full timeline editor. */
export function isEditorReadyDraft(
  draft: Pick<Draft, "pipelineStage" | "scenes">,
): boolean {
  if (draft.pipelineStage === "editor_ready") {
    return true;
  }

  if (draft.pipelineStage === "script_review" || draft.pipelineStage === "voiceover_ready") {
    return false;
  }

  return draft.scenes.length > 0;
}

export function resolveDraftWorkflowStatus(
  draft: Pick<Draft, "status" | "pipelineStage" | "scenes" | "script">,
): DraftWorkflowStatus {
  if (draft.status === "exported") {
    return "exported";
  }

  if (isEditorReadyDraft(draft)) {
    return "storyboard_ready";
  }

  if (isVoiceoverReadyDraft(draft)) {
    return "voice_ready";
  }

  return "script_review";
}

export function draftWorkflowStatusLabel(status: DraftWorkflowStatus): string {
  switch (status) {
    case "script_review":
      return "Story";
    case "voice_ready":
      return "Narration";
    case "storyboard_ready":
      return "Storyboard";
    case "exported":
      return "Exported";
  }
}

export function resolveDraftStatusLabel(
  draft: Pick<Draft, "status" | "pipelineStage" | "scenes" | "script">,
): string {
  return draftWorkflowStatusLabel(resolveDraftWorkflowStatus(draft));
}

/** Route users back into the staged review flow when the storyboard is not ready. */
export function shouldOpenScriptReview(draft: Draft): boolean {
  return !isEditorReadyDraft(draft);
}

export function resolveDraftHref(draft: Pick<Draft, "id" | "pipelineStage" | "scenes" | "script">): string {
  if (shouldOpenScriptReview(draft as Draft)) {
    return `/create/review/${draft.id}`;
  }

  return `/editor/${draft.id}`;
}

export function resolvePipelineStageFromScript(
  script: Draft["script"],
  current?: DraftPipelineStage,
): DraftPipelineStage {
  if (script.scenes.length > 0) {
    return "editor_ready";
  }

  if (getCanonicalVoiceover(script)?.url) {
    return "voiceover_ready";
  }

  return current ?? "script_review";
}

export function pipelineStageLabel(stage: DraftPipelineStage | undefined): string {
  switch (stage) {
    case "script_review":
      return "Story";
    case "voiceover_ready":
      return "Narration";
    case "editor_ready":
      return "Storyboard";
    default:
      return "Story";
  }
}

export function pipelineStageLabelForDraft(
  draft: Pick<Draft, "status" | "pipelineStage" | "scenes" | "script">,
): string {
  return resolveDraftStatusLabel(draft);
}
