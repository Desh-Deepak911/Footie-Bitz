import { type DisplayCaptionScene } from "@/features/story/utils";
export interface RenderSceneCaptionOptions {
    /** Caps visible lines (used for preview narration subtitles). */
    maxLines?: number;
    /** Active subtitle chunk (subtitles mode). */
    activeSubtitleChunk?: string;
    /** Progress through the active chunk time window (0–1), preview only. */
    chunkProgress?: number;
}
export declare function renderSceneCaptionContent(scene: DisplayCaptionScene & {
    id?: string;
}, className: string, animationSeed?: string, options?: RenderSceneCaptionOptions): import("react").JSX.Element | null;
//# sourceMappingURL=subtitleEffectPreview.d.ts.map