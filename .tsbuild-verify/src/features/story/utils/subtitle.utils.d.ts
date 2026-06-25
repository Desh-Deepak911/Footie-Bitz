import type { FootieScene } from "@/features/story/types";
export declare const SUBTITLE_MAX_WORDS_PER_CHUNK = 5;
export declare const SUBTITLE_MAX_CHARS_PER_CHUNK = 34;
/** Max on-screen rows for one subtitle chunk (preview + export). */
export declare const SUBTITLE_MAX_VISIBLE_LINES = 3;
/** Conservative wrap width estimate used when splitting overflow chunks. */
export declare const SUBTITLE_ESTIMATED_CHARS_PER_LINE = 16;
export declare const SUBTITLE_MAX_WIDTH_RATIO = 0.9;
/** True when a chunk is within subtitle limits (single words are always allowed). */
export declare function isSubtitleChunkWithinLimits(text: string): boolean;
/**
 * Splits narration into readable subtitle chunks (deterministic, no AI).
 * Prefers punctuation boundaries, then word splits, capped at 5 words / 34 chars.
 */
export declare function splitSubtitleChunks(text: string): string[];
/** Duration of one subtitle chunk — derived from scene duration, never stored. */
export declare function getSubtitleChunkDurationMs(sceneDurationMs: number, chunkCount: number): number;
/**
 * Returns the subtitle chunk that should be visible at a point within a scene.
 * Divides scene duration equally across precomputed chunks (deterministic, no AI).
 */
export declare function getActiveSubtitleChunkFromList(chunks: string[], sceneElapsedMs: number, sceneDurationMs: number): string;
/**
 * Returns the subtitle chunk that should be visible at a point within a scene.
 * Divides scene duration equally across chunks (deterministic, no AI).
 */
export declare function getActiveSubtitleChunk(text: string, sceneElapsedMs: number, sceneDurationMs: number): string;
/** Active chunk plus progress (0–1) within its time window. */
export declare function getActiveSubtitleChunkStateFromList(chunks: string[], sceneElapsedMs: number, sceneDurationMs: number): {
    chunk: string;
    progress: number;
    chunkElapsedMs: number;
};
/** Active chunk plus progress (0–1) within its time window. */
export declare function getActiveSubtitleChunkState(text: string, sceneElapsedMs: number, sceneDurationMs: number): {
    chunk: string;
    progress: number;
};
type SubtitleCaptionScene = Pick<FootieScene, "captionMode" | "subtitle" | "narration" | "subtitleText" | "subtitleEffect"> & {
    /** Generated on-screen caption (alias for `subtitle` when present). */
    caption?: string;
};
/** Full editable subtitle source — never uses generated caption fields. */
export declare function getSubtitlesCaptionSource(scene: SubtitleCaptionScene): string;
/** Deterministic subtitle chunks from the subtitles-mode source text. */
export declare function getSubtitleDisplayChunks(scene: SubtitleCaptionScene): string[];
/** Visible subtitle chunk for preview/export (first chunk when timing is omitted). */
export declare function getSubtitleDisplayChunk(scene: SubtitleCaptionScene, chunkIndex?: number): string;
/** Subtitle chunk visible at a point within the scene (preview timing). */
export declare function getTimedSubtitleDisplayChunk(scene: SubtitleCaptionScene, sceneElapsedMs: number, sceneDurationMs: number): string;
export {};
//# sourceMappingURL=subtitle.utils.d.ts.map