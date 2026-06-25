import type { CaptionMode, FootieScene, SubtitleEffect } from "@/features/story/types";
export declare const DEFAULT_CAPTION_MODE: CaptionMode;
export declare const DEFAULT_SUBTITLE_EFFECT: SubtitleEffect;
export declare const CAPTION_MODE_OPTIONS: {
    value: CaptionMode;
    label: string;
}[];
export declare const SUBTITLE_EFFECT_OPTIONS: {
    value: SubtitleEffect;
    label: string;
}[];
export declare function isCaptionMode(value: string): value is CaptionMode;
export declare function isSubtitleEffect(value: string): value is SubtitleEffect;
export declare function normalizeCaptionMode(value: unknown): CaptionMode;
export declare function normalizeSubtitleEffect(value: unknown): SubtitleEffect;
/** Applies default caption mode and subtitle effect to a scene (legacy-safe). */
export declare function normalizeSceneCaptionSettings(scene: FootieScene): FootieScene;
export declare function normalizeScenesCaptionSettings(scenes: FootieScene[]): FootieScene[];
/**
 * Forces AI-generated story scenes to use generated captions with the default effect.
 * Ignores any captionMode/subtitleEffect the model may return.
 */
export declare function applyGeneratedStorySceneCaptions(scenes: FootieScene[]): FootieScene[];
export declare function getCaptionModeLabel(mode: CaptionMode): string;
export declare function getSubtitleEffectLabel(effect: SubtitleEffect): string;
export type DisplayCaptionScene = Pick<FootieScene, "captionMode" | "subtitle" | "narration" | "subtitleText" | "subtitleEffect"> & {
    /** Generated on-screen caption (alias for `subtitle` when present). */
    caption?: string;
};
export interface DisplayCaptionTiming {
    sceneElapsedMs: number;
    sceneDurationMs: number;
}
/**
 * Returns the caption text that should be shown for a scene.
 * - `subtitles` mode → first readable chunk from `subtitleText || narration`
 * - otherwise → generated scene caption (`caption` or legacy `subtitle`)
 */
export declare function getDisplayCaption(scene: DisplayCaptionScene): string;
/**
 * Splits long caption/narration text into short readable lines (deterministic).
 * Words are grouped by `maxWordsPerLine`; whitespace is normalized between words.
 */
export declare function splitCaptionIntoLines(text: string, maxWordsPerLine?: number): string[];
/** Convenience: display caption split into readable lines for rendering. */
export declare function getDisplayCaptionLines(scene: DisplayCaptionScene, maxWordsPerLine?: number, timing?: DisplayCaptionTiming): string[];
type ExportCaptionScene = DisplayCaptionScene & {
    subtitleChunks?: string[];
};
/**
 * Resolves on-screen caption lines for export at a specific frame time.
 * Subtitles mode renders one timed chunk from `subtitleChunks`; generated mode is unchanged.
 */
export declare function getExportSceneCaptionLines(scene: ExportCaptionScene, timing: DisplayCaptionTiming, maxWordsPerLine?: number): string[];
/**
 * Splits full story narration into equal word segments — one per scene.
 * Deterministic — no AI. Remainder words go to the earliest scenes.
 */
export declare function splitNarrationEvenlyBySceneCount(fullNarration: string, sceneCount: number): string[];
/** Attaches script narration segments to scenes (even split, no AI). */
export declare function attachSceneNarrationFromScript(scenes: FootieScene[], fullNarration: string): FootieScene[];
/** Returns the voiceover excerpt for a scene when present (script segment, not AI caption). */
export declare function getSceneVoiceoverExcerpt(scene: FootieScene): string;
/**
 * Splits full story narration into per-scene excerpts proportional to scene duration.
 * Deterministic — no AI.
 */
export declare function deriveSceneNarrationExcerpts(fullNarration: string, scenes: FootieScene[]): string[];
export declare function deriveSceneNarrationExcerpt(fullNarration: string, sceneIndex: number, scenes: FootieScene[]): string;
/**
 * Whether per-scene narration excerpts should be re-derived from story narration.
 * Skips re-sync for visual-only edits such as `subtitleEffect`.
 */
export declare function scenesNeedNarrationExcerptSync(previousScenes: FootieScene[], nextScenes: FootieScene[], fullNarration: string, previousFullNarration?: string): boolean;
/**
 * When switching to subtitles mode, seeds `subtitleText` from the scene narration excerpt
 * if the user has not set subtitle copy yet.
 */
export declare function mergeSubtitleTextOnSubtitlesModeSwitch(scene: FootieScene, updates: Partial<FootieScene>): Partial<FootieScene>;
/**
 * After narration excerpts sync, fills `subtitleText` for scenes that just switched
 * to subtitles mode when the initial seed was still empty.
 */
export declare function finalizeSubtitleTextAfterModeSwitch(previousScenes: FootieScene[], nextScenes: FootieScene[]): FootieScene[];
/**
 * Keeps per-scene `narration` excerpts in sync for scenes in subtitles mode.
 * Deterministic — no AI.
 */
export declare function syncScenesSubtitlesNarration(scenes: FootieScene[], fullNarration: string): FootieScene[];
export {};
//# sourceMappingURL=caption.utils.d.ts.map