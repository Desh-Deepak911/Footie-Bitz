/** Matches `.subtitle-effect-fade-up` in globals.css */
export declare const FADE_UP_DURATION_MS = 500;
export declare const FADE_UP_Y_OFFSET_PX = 8;
export declare const FADE_UP_EASING: {
    readonly cp1x: 0.22;
    readonly cp1y: 1;
    readonly cp2x: 0.36;
    readonly cp2y: 1;
};
export interface FadeUpSubtitleFrame {
    opacity: number;
    yOffsetPx: number;
}
/** CSS cubic-bezier timing — maps linear progress to eased progress. */
export declare function cubicBezierTiming(linearProgress: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number): number;
/** Fade-up frame state for canvas/CSS export at a point within the active chunk. */
export declare function getFadeUpSubtitleFrame(chunkElapsedMs: number): FadeUpSubtitleFrame;
/** Typewriter reveal for export — matches preview `TypewriterProgressReveal`. */
export declare function getTypewriterRevealedText(text: string, chunkProgress: number): string;
export interface HighlightSubtitleFrame {
    /** 0–1 width of the highlight pill relative to full text width. */
    highlightWidthProgress: number;
    /** Vertical scale for the accent bar (0.88–1). */
    barScale: number;
    /** Background alpha for the text pill. */
    backgroundAlpha: number;
}
/** Highlight frame state — grows the pill/bar through the chunk for export. */
export declare function getHighlightSubtitleFrame(chunkProgress: number): HighlightSubtitleFrame;
/** Progress through the active subtitle chunk (0–1). */
export declare function getExportSubtitleEffectProgress(chunkElapsedMs: number, activeChunkDurationMs: number): number;
/** Export highlight frame — reveal over chunk duration with preview-like pulse. */
export declare function getExportHighlightSubtitleFrame(chunkElapsedMs: number, activeChunkDurationMs: number): HighlightSubtitleFrame;
//# sourceMappingURL=subtitle-effect.utils.d.ts.map