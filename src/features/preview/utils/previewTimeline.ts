import {
  ensureTimelineItems,
  getActiveSceneAtTime,
  getTransitionsFromTimeline,
} from "@/features/story/utils";
import type {
  FootieScene,
  TimelineItem,
  TransitionEffect,
  TransitionTimelineItem,
} from "@/features/story/types";

export type PreviewSceneFrame = {
  kind: "scene";
  scene: FootieScene;
  sceneIndex: number;
};

export type PreviewTransitionFrame = {
  kind: "transition";
  transition: TransitionTimelineItem;
  fromScene: FootieScene;
  toScene: FootieScene;
  fromSceneIndex: number;
  toSceneIndex: number;
  progress: number;
};

export type PreviewFrame = PreviewSceneFrame | PreviewTransitionFrame;

export type TransitionLayerStyles = {
  from: { opacity?: number; transform?: string; filter?: string; zIndex?: number };
  to: { opacity?: number; transform?: string; filter?: string; zIndex?: number };
};

/** Finds the transition item between two adjacent scenes, if present. */
export function getTransitionBetweenScenes(
  timelineItems: TimelineItem[],
  fromSceneId: string,
  toSceneId: string,
): TransitionTimelineItem | undefined {
  return getTransitionsFromTimeline(timelineItems).find(
    (item) => item.fromSceneId === fromSceneId && item.toSceneId === toSceneId,
  );
}

/**
 * Resolves the preview frame at a given time (seconds).
 * Scene timing map is the only playback authority — transition items are overlay
 * metadata and never become their own preview segment.
 */
export function getPreviewFrameAtTime(
  _timelineItems: TimelineItem[],
  scenes: FootieScene[],
  timeSec: number,
): PreviewSceneFrame {

  if (scenes.length === 0) {
    throw new Error("Cannot resolve preview frame without scenes");
  }

  const activeSlot = getActiveSceneAtTime(scenes, timeSec * 1000);
  const sceneIndex = activeSlot?.index ?? 0;
  const scene = scenes[sceneIndex] ?? scenes[0]!;

  return {
    kind: "scene",
    scene,
    sceneIndex: scenes[sceneIndex] ? sceneIndex : 0,
  };
}

/** CSS styles for from/to layers during a transition preview. */
export function getTransitionLayerStyles(
  effect: TransitionEffect,
  progress: number,
): TransitionLayerStyles {
  const p = Math.min(1, Math.max(0, progress));

  switch (effect) {
    case "cut":
      return {
        from: { opacity: 0, zIndex: 1 },
        to: { opacity: 1, zIndex: 2 },
      };
    case "fade":
      return {
        from: { opacity: 1 - p, zIndex: 1 },
        to: { opacity: p, zIndex: 2 },
      };
    case "slide-left":
      return {
        from: { transform: `translateX(${-p * 100}%)`, opacity: 1, zIndex: 1 },
        to: { transform: `translateX(${(1 - p) * 100}%)`, opacity: 1, zIndex: 2 },
      };
    case "slide-right":
      return {
        from: { transform: `translateX(${p * 100}%)`, opacity: 1, zIndex: 1 },
        to: { transform: `translateX(${-(1 - p) * 100}%)`, opacity: 1, zIndex: 2 },
      };
    case "zoom-in":
      return {
        from: { opacity: 1 - p, zIndex: 1 },
        to: {
          transform: `scale(${1.08 - p * 0.08})`,
          opacity: p,
          zIndex: 2,
        },
      };
    case "zoom-out":
      return {
        from: {
          transform: `scale(${1 - p * 0.08})`,
          opacity: 1 - p,
          zIndex: 1,
        },
        to: { opacity: p, zIndex: 2 },
      };
    case "blur":
      return {
        from: { filter: `blur(${p * 8}px)`, opacity: 1 - p * 0.25, zIndex: 1 },
        to: { filter: `blur(${(1 - p) * 8}px)`, opacity: p, zIndex: 2 },
      };
    default:
      return {
        from: { opacity: 1 - p, zIndex: 1 },
        to: { opacity: p, zIndex: 2 },
      };
  }
}

/** Runs a transition animation; returns a cancel function. */
export function animateTransitionProgress(
  durationMs: number,
  onProgress: (progress: number) => void,
  onComplete: () => void,
): () => void {
  if (durationMs <= 0) {
    onProgress(1);
    onComplete();
    return () => {};
  }

  const start = performance.now();
  let frameId = 0;

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / durationMs);
    onProgress(progress);

    if (progress < 1) {
      frameId = requestAnimationFrame(tick);
    } else {
      onComplete();
    }
  };

  frameId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frameId);
  };
}

/** Builds a transition frame for manual/browser playback between two scenes. */
export function buildTransitionFrame(
  timelineItems: TimelineItem[],
  scenes: FootieScene[],
  fromSceneIndex: number,
  toSceneIndex: number,
  progress: number,
): PreviewFrame {
  const fromScene = scenes[fromSceneIndex];
  const toScene = scenes[toSceneIndex];
  const transition = getTransitionBetweenScenes(timelineItems, fromScene.id, toScene.id);

  if (!transition) {
    return { kind: "scene", scene: toScene, sceneIndex: toSceneIndex };
  }

  return {
    kind: "transition",
    transition,
    fromScene,
    toScene,
    fromSceneIndex,
    toSceneIndex,
    progress,
  };
}

/** Ensures a valid timeline, upgrading legacy scene-only stories when needed. */
export function resolveTimelineItems(
  timelineItems: TimelineItem[] | undefined,
  scenes: FootieScene[],
): TimelineItem[] {
  return ensureTimelineItems(scenes, timelineItems);
}

export function isPreviewTransitionFrame(frame: PreviewFrame): frame is PreviewTransitionFrame {
  return frame.kind === "transition";
}
