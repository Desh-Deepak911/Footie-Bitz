import type { FootieScene } from "@/features/story/types";
import type { DisplayCaptionScene } from "./caption.utils";
/** Scene-local clock used to derive subtitle chunk timing (never persisted). */
export interface SubtitleSceneTiming {
    sceneElapsedMs: number;
    sceneDurationMs: number;
}
/** Dynamically derived subtitle state for one frame — no stored timeline. */
export interface ActiveSubtitleTiming {
    activeChunk: string;
    chunkIndex: number;
    chunkCount: number;
    chunkDurationMs: number;
    chunkElapsedMs: number;
    chunkProgress: number;
}
/** Resolves the active subtitle chunk and animation progress from scene timing. */
export declare function resolveActiveSubtitleTiming(chunks: string[], timing: SubtitleSceneTiming): ActiveSubtitleTiming;
/** Resolves subtitle chunks from scene copy (text only — no timing stored). */
export declare function resolveSubtitleChunksForScene(scene: DisplayCaptionScene): string[];
/** Preview/export path: scene clock → active subtitle chunk. */
export declare function resolveActiveSubtitleForScene(scene: DisplayCaptionScene, timing: SubtitleSceneTiming): ActiveSubtitleTiming;
/**
 * Full playback pipeline:
 * currentTime → currentScene → sceneElapsedMs → activeSubtitleChunk
 */
export declare function resolveActiveSubtitleAtGlobalTime(scenes: FootieScene[], scene: DisplayCaptionScene, currentTimeMs: number): ActiveSubtitleTiming | null;
//# sourceMappingURL=subtitle-timing.utils.d.ts.map