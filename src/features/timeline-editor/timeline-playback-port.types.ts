/** Read-only preview clock snapshot for timeline presentation. */
export interface TimelinePlaybackSnapshot {
  currentTimeMs: number;
  renderDurationMs: number;
  isPlaying: boolean;
  activeSceneId?: string | null;
}

export const EMPTY_TIMELINE_PLAYBACK_SNAPSHOT: TimelinePlaybackSnapshot = {
  currentTimeMs: 0,
  renderDurationMs: 0,
  isPlaying: false,
  activeSceneId: null,
};

/** Clamps timeline progress to [0, 1]. Returns 0 when duration is missing. */
export function clampTimelinePlaybackProgress(
  currentTimeMs: number,
  renderDurationMs: number,
): number {
  if (renderDurationMs <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, currentTimeMs / renderDurationMs));
}
