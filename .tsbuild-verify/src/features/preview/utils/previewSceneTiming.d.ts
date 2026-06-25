import type { FootieScene } from "@/features/story/types";
export interface PreviewSceneTimingInput {
    scenes: FootieScene[];
    sceneIndex: number;
    elapsedSec: number;
    playbackMode: "browser" | "narration" | null;
    isPlaying: boolean;
    browserSceneStartedAtMs: number | null;
    previewClockMs: number;
}
export interface PreviewSceneTiming {
    sceneElapsedMs: number;
    sceneDurationMs: number;
    /** Active scene index derived from global playback time (narration mode). */
    activeSceneIndex?: number;
}
/** Derives scene-local preview timing from playback clocks and the timing map. */
export declare function getPreviewSceneTiming({ scenes, sceneIndex, elapsedSec, playbackMode, isPlaying, browserSceneStartedAtMs, previewClockMs, }: PreviewSceneTimingInput): PreviewSceneTiming;
//# sourceMappingURL=previewSceneTiming.d.ts.map