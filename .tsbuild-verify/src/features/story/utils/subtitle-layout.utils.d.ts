export type MeasureTextWidth = (text: string) => number;
export interface WrapSubtitleLinesOptions {
    maxLines?: number;
    maxCharsPerLine?: number;
}
/** Word-wraps subtitle copy into at most `maxLines` rows using a width measure. */
export declare function wrapSubtitleTextToLines(text: string, maxWidth: number, measureWidth: MeasureTextWidth, maxLines?: number): string[];
/** Estimates display lines for preview/export metadata without canvas metrics. */
export declare function wrapSubtitleTextToDisplayLines(text: string, options?: WrapSubtitleLinesOptions): string[];
/** Canvas helper — wraps using measured glyph widths. */
export declare function wrapSubtitleTextForCanvas(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines?: number): string[];
//# sourceMappingURL=subtitle-layout.utils.d.ts.map