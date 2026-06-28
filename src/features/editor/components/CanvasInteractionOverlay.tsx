"use client";

import CanvasHint from "@/features/editor/components/CanvasHint";
import CanvasToast from "@/features/editor/components/CanvasToast";

export interface CanvasInteractionOverlayProps {
  showHints: boolean;
  scale: number;
  panX: number;
  panY: number;
  interactionActive: boolean;
}

/**
 * Contextual canvas guidance and live edit feedback.
 * All children are pointer-events-none and do not interfere with drag.
 */
export default function CanvasInteractionOverlay({
  showHints,
  scale,
  panX,
  panY,
  interactionActive,
}: CanvasInteractionOverlayProps) {
  return (
    <>
      <CanvasHint visible={showHints} />
      <CanvasToast
        scale={scale}
        panX={panX}
        panY={panY}
        interactionActive={interactionActive}
      />
    </>
  );
}
