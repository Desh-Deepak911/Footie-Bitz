import type { ExportSubtitleDisplay } from "@/features/export/utils/export-subtitle.utils";
export interface DrawExportSubtitlesCaptionOptions {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    subtitleY: number;
    scale: number;
    display: ExportSubtitleDisplay;
}
export interface ExportSubtitleLayoutMetrics {
    fontSize: number;
    lineHeight: number;
    maxBoxWidth: number;
    maxTextWidth: number;
    padX: number;
    padY: number;
}
export declare function getExportSubtitleLayoutMetrics(scale: number): ExportSubtitleLayoutMetrics;
/**
 * Word-wraps text into at most `maxLines` rows using canvas measurement.
 * Overflow beyond maxLines is omitted — chunking should split copy earlier.
 */
export declare function wrapTextToLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines?: number): string[];
/** Resets canvas draw state so subtitle frames never inherit prior alpha/composite settings. */
export declare function resetExportCanvasDrawState(ctx: CanvasRenderingContext2D): void;
/** Resets canvas draw state before drawing subtitle copy for one frame. */
export declare function prepareExportSubtitleLayer(ctx: CanvasRenderingContext2D): void;
export interface ExportSubtitleTextBlockSize {
    boxWidth: number;
    boxHeight: number;
    widestLineWidth: number;
}
/** Measures wrapped lines and returns one content-sized pill around the text block. */
export declare function resolveExportSubtitleTextBlockSize(ctx: CanvasRenderingContext2D, lines: string[], metrics: ExportSubtitleLayoutMetrics): ExportSubtitleTextBlockSize;
/** Content-sized pill width capped at 90% of frame — matches preview max-width behavior. */
export declare function resolveExportSubtitleBoxWidth(ctx: CanvasRenderingContext2D, lines: string[], metrics: ExportSubtitleLayoutMetrics): number;
/** Draws bottom-centered export subtitles for the single active chunk. */
export declare function drawExportSubtitlesCaption(options: DrawExportSubtitlesCaptionOptions): void;
/** Draws bottom-centered generated captions without subtitle effects. */
export declare function drawExportGeneratedCaption(ctx: CanvasRenderingContext2D, lines: string[], width: number, height: number, subtitleY: number, scale: number): void;
//# sourceMappingURL=export-caption-canvas.utils.d.ts.map