import type { FootieScene } from "@/features/story/types";

const TRANSITION_LABELS: Record<string, string> = {
  cut: "Cut",
  fade: "Fade",
  "slide-left": "Slide left",
  "slide-right": "Slide right",
  "slide-up": "Slide up",
  "slide-down": "Slide down",
  "zoom-in": "Zoom in",
  "zoom-out": "Zoom out",
  blur: "Blur",
  wipe: "Wipe",
};

/** Human-readable transition label for timeline tooltips. */
export function formatTransitionLabel(transitionType?: string): string {
  if (!transitionType) {
    return "Transition";
  }

  return TRANSITION_LABELS[transitionType] ?? transitionType.replace(/-/g, " ");
}

/** Compact scene caption for timeline block metadata. */
export function formatSceneTimelineCaption(scene: FootieScene): string {
  const subtitle = scene.subtitle?.trim();
  if (subtitle) {
    return subtitle;
  }

  if (scene.sceneType) {
    return scene.sceneType.charAt(0).toUpperCase() + scene.sceneType.slice(1);
  }

  return "Untitled scene";
}
