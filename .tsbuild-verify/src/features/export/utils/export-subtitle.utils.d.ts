import type { ExportScene } from "@/features/export/services/export-payload.service";
import type { SubtitleEffect } from "@/features/story/types";
import { type DisplayCaptionTiming } from "@/features/story/utils";
/** @deprecated Use SUBTITLE_MAX_VISIBLE_LINES */
export declare const EXPORT_SUBTITLE_MAX_VISIBLE_LINES = 3;
type ExportSubtitleScene = Pick<ExportScene, "captionMode" | "subtitleEffect" | "subtitleChunks" | "subtitleText" | "narration" | "subtitle">;
export interface ExportSubtitleChunkState {
    chunk: string;
    progress: number;
    chunkElapsedMs: number;
    activeChunkDurationMs: number;
    effectProgress: number;
}
export declare function getExportActiveChunkDurationMs(sceneDurationMs: number, chunkCount: number): number;
/** Returns the single timed subtitle chunk visible at this export frame. */
export declare function getExportActiveSubtitleChunk(scene: ExportSubtitleScene, timing: DisplayCaptionTiming): string;
/** Active chunk timing state for export frame rendering. */
export declare function getExportSubtitleChunkState(scene: ExportSubtitleScene, timing: DisplayCaptionTiming): ExportSubtitleChunkState;
export interface ExportSubtitleDisplay {
    /** The one timed chunk selected for this frame. */
    activeChunk: string;
    /** Word-wrap rows derived from the active chunk (typewriter uses progressive reveal). */
    lines: string[];
    effect: SubtitleEffect;
    sceneElapsedMs: number;
    chunkElapsedMs: number;
    activeChunkDurationMs: number;
    effectProgress: number;
}
/**
 * Resolves export subtitle display for one frame — exactly one timed chunk,
 * never the full subtitle array or adjacent chunks.
 */
export declare function resolveExportSubtitleDisplay(scene: ExportSubtitleScene, timing: DisplayCaptionTiming): ExportSubtitleDisplay | null;
export {};
//# sourceMappingURL=export-subtitle.utils.d.ts.map