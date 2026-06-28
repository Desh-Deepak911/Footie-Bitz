"use client";

import { useMemo } from "react";

import CanvasGuide from "@/features/editor/components/CanvasGuide";
import GuideLabel, { GuideLabelStack } from "@/features/editor/components/GuideLabel";
import {
  CANVAS_GUIDE_LABELS,
  resolveCanvasGuides,
  resolvePrimaryCanvasGuideLabel,
  type CanvasGuideThresholds,
  DEFAULT_CANVAS_GUIDE_THRESHOLDS,
} from "@/features/editor/utils/resolveCanvasGuides.utils";
import type { SceneImage } from "@/features/story/types";

export interface CanvasGuideLayerProps {
  visible: boolean;
  image: SceneImage;
  thresholds?: CanvasGuideThresholds;
}

/**
 * Smart framing guides for canvas edit mode — visual + label feedback only.
 */
export default function CanvasGuideLayer({
  visible,
  image,
  thresholds = DEFAULT_CANVAS_GUIDE_THRESHOLDS,
}: CanvasGuideLayerProps) {
  const activeGuides = useMemo(
    () => (visible ? resolveCanvasGuides(image, thresholds) : []),
    [image, thresholds, visible],
  );

  const primaryLabel = resolvePrimaryCanvasGuideLabel(activeGuides);
  const secondaryLabels = activeGuides
    .slice(1, 3)
    .map((kind) => CANVAS_GUIDE_LABELS[kind]);

  const visualGuides = activeGuides.filter(
    (kind) => !(kind === "centered" && activeGuides.includes("resetPosition")),
  );

  const guidesVisible = visible && activeGuides.length > 0;

  if (!visible) {
    return null;
  }

  return (
    <>
      {visualGuides.map((kind) => (
        <CanvasGuide key={kind} kind={kind} visible={guidesVisible} />
      ))}
      {primaryLabel ? <GuideLabel label={primaryLabel} visible={guidesVisible} /> : null}
      <GuideLabelStack labels={secondaryLabels} visible={guidesVisible} />
    </>
  );
}
