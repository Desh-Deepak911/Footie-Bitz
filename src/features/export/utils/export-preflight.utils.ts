import { getCanonicalVoiceover } from "@/features/audio/utils/canonical-voiceover.utils";
import type { FootieScene, FootieScript } from "@/features/story/types";
import { getStoryTotalDuration } from "@/features/story/utils/scene.utils";
import {
  attachEvenVoiceoverTiming,
  attachVoiceoverTimingMs,
  recalculateSceneTimings,
} from "@/features/story/utils/timeline.utils";
import { syncFootieScript } from "@/lib/voiceover";
import {
  resolveNarrationVoiceoverMismatchWarning,
} from "./export-narration-voiceover.utils";

/** Ignore sub-frame drift when comparing scene sum to voiceover duration. */
const EXPORT_DURATION_SYNC_TOLERANCE_MS = 50;

export interface PrepareStoryForExportResult {
  story: FootieScript;
  exportDurationMs: number;
  warnings: string[];
}

function resolveSceneTimelineDurationMs(scenes: FootieScript["scenes"]): number {
  return Math.max(0, Math.round(getStoryTotalDuration(scenes) * 1000));
}

function formatDurationSec(durationMs: number): string {
  return (durationMs / 1000).toFixed(1);
}

/** Returns scene duration weight in ms, or null when timing is missing/invalid. */
function resolveExportSceneDurationWeightMs(scene: FootieScene): number | null {
  if (scene.durationMs != null && scene.durationMs > 0) {
    return scene.durationMs;
  }

  if (scene.duration != null && scene.duration > 0) {
    return Math.round(scene.duration * 1000);
  }

  return null;
}

/**
 * Scales scene durations to voiceover length while preserving user timing intent.
 * Uses proportional weights when every scene has valid duration; otherwise splits evenly.
 * Only timing fields are updated — captions, media, and subtitle copy are untouched.
 */
function refitScenesForExportVoiceover(
  scenes: FootieScene[],
  voiceoverDurationMs: number,
): FootieScene[] {
  if (scenes.length === 0) {
    return scenes;
  }

  const weights = scenes.map(resolveExportSceneDurationWeightMs);
  const hasInvalidDuration = weights.some((weight) => weight == null);

  const timedScenes = hasInvalidDuration
    ? attachEvenVoiceoverTiming(scenes, voiceoverDurationMs)
    : attachVoiceoverTimingMs(scenes, voiceoverDurationMs, weights as number[]);

  return recalculateSceneTimings(timedScenes);
}

/**
 * Builds an export-normalized story copy without mutating editor state.
 * When voiceover audio is present with duration metadata, scene timings are
 * refitted so the export timeline matches voiceoverDurationMs.
 */
export function prepareStoryForExport(story: FootieScript): PrepareStoryForExportResult {
  const warnings: string[] = [];
  const synced = syncFootieScript(story);
  const canonicalVoiceover = getCanonicalVoiceover(synced);

  const voiceoverUrl = canonicalVoiceover?.url;
  const voiceoverDurationMs = canonicalVoiceover?.durationMs;
  const hasValidVoiceover = Boolean(
    voiceoverUrl && voiceoverDurationMs != null && voiceoverDurationMs > 0,
  );

  if (hasValidVoiceover) {
    const authorityDurationMs = Math.round(voiceoverDurationMs!);
    const sceneTimelineDurationMs = resolveSceneTimelineDurationMs(synced.scenes);

    const narrationMismatchWarning = resolveNarrationVoiceoverMismatchWarning(synced);
    if (narrationMismatchWarning) {
      warnings.push(narrationMismatchWarning);
    }

    if (
      sceneTimelineDurationMs > 0 &&
      Math.abs(sceneTimelineDurationMs - authorityDurationMs) > EXPORT_DURATION_SYNC_TOLERANCE_MS
    ) {
      warnings.push(
        `Scene timeline (${formatDurationSec(sceneTimelineDurationMs)}s) did not match voiceover (${formatDurationSec(authorityDurationMs)}s). Export refitted scenes to voiceover duration.`,
      );
    }

    const refittedScenes = refitScenesForExportVoiceover(synced.scenes, authorityDurationMs);
    const normalizedStory = syncFootieScript({
      ...synced,
      voiceoverUrl,
      voiceoverDurationMs: authorityDurationMs,
      scenes: refittedScenes,
    });

    return {
      story: normalizedStory,
      exportDurationMs: authorityDurationMs,
      warnings,
    };
  }

  const recalculatedScenes = recalculateSceneTimings(synced.scenes);
  const normalizedStory = syncFootieScript({
    ...synced,
    scenes: recalculatedScenes,
  });
  const exportDurationMs = resolveSceneTimelineDurationMs(normalizedStory.scenes);

  if (voiceoverUrl && voiceoverDurationMs == null) {
    warnings.push(
      "Voiceover is missing duration metadata. Export uses the scene timeline length.",
    );
  }

  if (exportDurationMs <= 0) {
    warnings.push("Export timeline duration is zero. Add scenes or voiceover before exporting.");
  }

  return {
    story: normalizedStory,
    exportDurationMs,
    warnings,
  };
}
