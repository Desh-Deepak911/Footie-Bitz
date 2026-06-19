import { revokeBlobUrl } from "@/lib/blobUrl";
import { getStoryTotalDuration } from "@/lib/sceneTiming";
import type { FootieScript } from "@/types/footiebitz";

/**
 * Narration only needs to be recreated when the narration TEXT changes.
 * Scene additions, removals, reorderings, and duration edits do not affect
 * the audio — the FFmpeg mux trims/pads to match the final video duration.
 */
function narrationNeedsRefresh(prev: FootieScript, next: FootieScript): boolean {
  return prev.narration !== next.narration;
}

/**
 * Applies a story update, revoking and clearing any stale narration blob URL
 * when the narration text has changed.
 */
export function applyStoryUpdate(prev: FootieScript, next: FootieScript): FootieScript {
  const synced = syncFootieScript(next);

  if (!prev.voiceoverUrl || !narrationNeedsRefresh(prev, synced)) {
    return synced;
  }

  revokeBlobUrl(prev.voiceoverUrl);
  return { ...synced, voiceoverUrl: undefined };
}

/**
 * Recomputes totalDuration from the current scene list.
 * Does NOT re-run timing normalisation — callers are responsible for ensuring
 * scene start/end values are already correct (e.g. via recalculateSceneTimings).
 */
export function syncFootieScript(script: FootieScript): FootieScript {
  const totalDuration = getStoryTotalDuration(script.scenes);
  return { ...script, totalDuration };
}
