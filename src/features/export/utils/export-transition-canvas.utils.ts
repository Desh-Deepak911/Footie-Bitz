import { getTransitionLayerStyles } from "@/features/preview/utils/previewTimeline";
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

function parseExportTransitionLayerStyle(style: {
  opacity?: number;
  transform?: string;
  filter?: string;
}): ExportTransitionLayerDrawState {
  const opacity = style.opacity ?? 1;
  let translateXRatio = 0;
  let scale = 1;
  let blurPx = 0;

  if (style.transform) {
    const translateMatch = style.transform.match(/translateX\(([-\d.]+)%\)/);
    if (translateMatch) {
      translateXRatio = parseFloat(translateMatch[1]) / 100;
    }

    const scaleMatch = style.transform.match(/scale\(([\d.]+)\)/);
    if (scaleMatch) {
      scale = parseFloat(scaleMatch[1]);
    }
  }

  if (style.filter) {
    const blurMatch = style.filter.match(/blur\(([\d.]+)px\)/);
    if (blurMatch) {
      blurPx = parseFloat(blurMatch[1]);
    }
  }

  return { opacity, translateXRatio, scale, blurPx };
}

export function getExportTransitionLayerDrawStates(
  effect: TransitionEffect,
  progress: number,
): { from: ExportTransitionLayerDrawState; to: ExportTransitionLayerDrawState } {
  const styles = getTransitionLayerStyles(effect, progress);

  return {
    from: parseExportTransitionLayerStyle(styles.from),
    to: parseExportTransitionLayerStyle(styles.to),
  };
}

function drawExportTransitionLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  drawBackground: DrawExportSceneBackgroundFn,
  layer: ExportTransitionLayerDrawState,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();

  ctx.globalAlpha = layer.opacity;

  if (layer.blurPx > 0) {
    ctx.filter = `blur(${layer.blurPx}px)`;
  }

  ctx.translate(width / 2, height / 2);
  ctx.scale(layer.scale, layer.scale);
  ctx.translate(-width / 2 + layer.translateXRatio * width, -height / 2);

  drawBackground(ctx, width, height);
  ctx.restore();
}

function drawExportTransitionLayers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  effect: TransitionEffect,
  progress: number,
  drawFromBackground: DrawExportSceneBackgroundFn,
  drawToBackground: DrawExportSceneBackgroundFn,
): void {
  const { from, to } = getExportTransitionLayerDrawStates(effect, progress);

  drawExportTransitionLayer(ctx, width, height, drawFromBackground, from);
  drawExportTransitionLayer(ctx, width, height, drawToBackground, to);
}

export interface DrawExportTransitionBackgroundsOptions {
  effect: TransitionEffect;
  progress: number;
  drawFromBackground: DrawExportSceneBackgroundFn;
  drawToBackground: DrawExportSceneBackgroundFn;
}

/** Composites outgoing and incoming scene backgrounds using the preview transition map. */
export function drawExportTransitionBackgrounds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: DrawExportTransitionBackgroundsOptions,
): void {
  const { effect, progress, drawFromBackground, drawToBackground } = options;

  try {
    drawExportTransitionLayers(
      ctx,
      width,
      height,
      effect,
      progress,
      drawFromBackground,
      drawToBackground,
    );
  } catch {
    drawExportTransitionLayers(
      ctx,
      width,
      height,
      "fade",
      progress,
      drawFromBackground,
      drawToBackground,
    );
  }
}
