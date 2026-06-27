import { getCanonicalVoiceover } from "@/features/audio/utils/canonical-voiceover.utils";
import type { FootieScene, FootieScript } from "@/features/story/types";
import {
  deriveSceneNarrationExcerpts,
  normalizeCaptionMode,
} from "@/features/story/utils/caption.utils";

export const EXPORT_NARRATION_VOICEOVER_MISMATCH_WARNING =
  "Your script changed after narration was recorded. Update narration for the best sync.";

function normalizeNarrationText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function hasSceneNarrationDrift(
  scenes: FootieScene[],
  snapshotNarration: string,
): boolean {
  const expectedExcerpts = deriveSceneNarrationExcerpts(snapshotNarration, scenes);

  return scenes.some((scene, index) => {
    if (normalizeCaptionMode(scene.captionMode) !== "subtitles") {
      return false;
    }

    const current = normalizeNarrationText(scene.narration);
    const expected = normalizeNarrationText(expectedExcerpts[index]);
    return current !== expected;
  });
}

/** True when voiceover exists but story or scene narration no longer matches the generated snapshot. */
export function hasNarrationVoiceoverMismatch(story: FootieScript): boolean {
  const canonicalVoiceover = getCanonicalVoiceover(story);
  if (!canonicalVoiceover?.url) {
    return false;
  }

  const snapshotNarration = story.voiceoverNarration;
  if (snapshotNarration == null || snapshotNarration === "") {
    return false;
  }

  const currentScriptNarration = normalizeNarrationText(story.narration);
  const normalizedSnapshot = normalizeNarrationText(snapshotNarration);
  if (currentScriptNarration !== normalizedSnapshot) {
    return true;
  }

  return hasSceneNarrationDrift(story.scenes, normalizedSnapshot);
}

export function resolveNarrationVoiceoverMismatchWarning(
  story: FootieScript,
): string | undefined {
  return hasNarrationVoiceoverMismatch(story)
    ? EXPORT_NARRATION_VOICEOVER_MISMATCH_WARNING
    : undefined;
}
