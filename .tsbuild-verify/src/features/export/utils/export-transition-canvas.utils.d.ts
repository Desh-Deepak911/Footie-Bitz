import type { TransitionEffect } from "@/features/story/types";
export interface ExportTransitionLayerDrawState {
    opacity: number;
    translateXRatio: number;
    scale: number;
    blurPx: number;
}
export interface DrawExportSceneBackgroundFn {
    (ctx: CanvasRenderingContext2D, width: number, height: number): void;
}
export declare function getExportTransitionLayerDrawStates(effect: TransitionEffect, progress: number): {
    from: ExportTransitionLayerDrawState;
    to: ExportTransitionLayerDrawState;
};
export interface DrawExportTransitionBackgroundsOptions {
    effect: TransitionEffect;
    progress: number;
    drawFromBackground: DrawExportSceneBackgroundFn;
    drawToBackground: DrawExportSceneBackgroundFn;
}
/** Composites outgoing and incoming scene backgrounds using the preview transition map. */
export declare function drawExportTransitionBackgrounds(ctx: CanvasRenderingContext2D, width: number, height: number, options: DrawExportTransitionBackgroundsOptions): void;
//# sourceMappingURL=export-transition-canvas.utils.d.ts.map