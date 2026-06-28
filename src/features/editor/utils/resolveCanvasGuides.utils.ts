import type { SceneImage } from "@/features/story/types";
import {
  clampSceneImageScale,
  DEFAULT_IMAGE_SCALE,
  normalizeSceneImageFitMode,
} from "@/features/story/utils";

/** Visual guide identifiers resolved from scene image transform state. */
export type CanvasGuideKind =
  | "centered"
  | "topAligned"
  | "bottomAligned"
  | "frameFilled"
  | "resetPosition"
  | "edgeLeft"
  | "edgeRight";

export interface CanvasGuideThresholds {
  /** Reference-space pan delta treated as horizontally/vertically centered. */
  centerPan: number;
  /** Reference-space pan delta treated as default reset position. */
  resetPan: number;
  /** Scale delta from 1× treated as default reset zoom. */
  resetScaleDelta: number;
  /** Reference-space pan magnitude treated as aligned to a frame edge. */
  edgePan: number;
  /** Minimum scale (fill mode) to treat the frame as fully filled. */
  fillMinScale: number;
}

export const DEFAULT_CANVAS_GUIDE_THRESHOLDS: CanvasGuideThresholds = {
  centerPan: 36,
  resetPan: 18,
  resetScaleDelta: 0.04,
  edgePan: 120,
  fillMinScale: 1,
};

export const CANVAS_GUIDE_LABELS: Record<CanvasGuideKind, string> = {
  centered: "Centered",
  topAligned: "Top aligned",
  bottomAligned: "Bottom aligned",
  frameFilled: "Frame filled",
  resetPosition: "Reset position",
  edgeLeft: "Left edge",
  edgeRight: "Right edge",
};

const GUIDE_LABEL_PRIORITY: CanvasGuideKind[] = [
  "resetPosition",
  "frameFilled",
  "topAligned",
  "bottomAligned",
  "edgeLeft",
  "edgeRight",
  "centered",
];

function isNear(value: number, target: number, threshold: number): boolean {
  return Math.abs(value - target) <= threshold;
}

/**
 * Resolves which canvas framing guides should be visible for the current image transform.
 * Presentation-only — does not mutate or validate transforms.
 */
export function resolveCanvasGuides(
  image: SceneImage,
  thresholds: CanvasGuideThresholds = DEFAULT_CANVAS_GUIDE_THRESHOLDS,
): CanvasGuideKind[] {
  const scale = clampSceneImageScale(image.scale);
  const x = image.x ?? 0;
  const y = image.y ?? 0;
  const fitMode = normalizeSceneImageFitMode(image.fitMode);
  const guides = new Set<CanvasGuideKind>();

  const atReset =
    isNear(x, 0, thresholds.resetPan) &&
    isNear(y, 0, thresholds.resetPan) &&
    isNear(scale, DEFAULT_IMAGE_SCALE, thresholds.resetScaleDelta);

  if (atReset) {
    guides.add("resetPosition");
  }

  if (isNear(x, 0, thresholds.centerPan) && isNear(y, 0, thresholds.centerPan)) {
    guides.add("centered");
  }

  if (fitMode === "fill" && scale >= thresholds.fillMinScale) {
    guides.add("frameFilled");
  }

  if (y <= -thresholds.edgePan) {
    guides.add("topAligned");
  } else if (y >= thresholds.edgePan) {
    guides.add("bottomAligned");
  }

  if (x <= -thresholds.edgePan) {
    guides.add("edgeLeft");
  } else if (x >= thresholds.edgePan) {
    guides.add("edgeRight");
  }

  return GUIDE_LABEL_PRIORITY.filter((kind) => guides.has(kind));
}

/** Primary label — highest-priority active guide. */
export function resolvePrimaryCanvasGuideLabel(guides: CanvasGuideKind[]): string | null {
  const primary = guides[0];
  return primary ? CANVAS_GUIDE_LABELS[primary] : null;
}
