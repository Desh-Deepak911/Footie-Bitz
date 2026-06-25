import type { FootieScene, TimelineItem, TransitionEffect, TransitionTimelineItem } from "@/features/story/types";
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
    from: {
        opacity?: number;
        transform?: string;
        filter?: string;
        zIndex?: number;
    };
    to: {
        opacity?: number;
        transform?: string;
        filter?: string;
        zIndex?: number;
    };
};
/** Finds the transition item between two adjacent scenes, if present. */
export declare function getTransitionBetweenScenes(timelineItems: TimelineItem[], fromSceneId: string, toSceneId: string): TransitionTimelineItem | undefined;
/**
 * Resolves the preview frame at a given time (seconds).
 * Scene timing map is the only playback authority — transition items are overlay
 * metadata and never become their own preview segment.
 */
export declare function getPreviewFrameAtTime(_timelineItems: TimelineItem[], scenes: FootieScene[], timeSec: number): PreviewSceneFrame;
/** CSS styles for from/to layers during a transition preview. */
export declare function getTransitionLayerStyles(effect: TransitionEffect, progress: number): TransitionLayerStyles;
/** Runs a transition animation; returns a cancel function. */
export declare function animateTransitionProgress(durationMs: number, onProgress: (progress: number) => void, onComplete: () => void): () => void;
/** Builds a transition frame for manual/browser playback between two scenes. */
export declare function buildTransitionFrame(timelineItems: TimelineItem[], scenes: FootieScene[], fromSceneIndex: number, toSceneIndex: number, progress: number): PreviewFrame;
/** Ensures a valid timeline, upgrading legacy scene-only stories when needed. */
export declare function resolveTimelineItems(timelineItems: TimelineItem[] | undefined, scenes: FootieScene[]): TimelineItem[];
export declare function isPreviewTransitionFrame(frame: PreviewFrame): frame is PreviewTransitionFrame;
//# sourceMappingURL=previewTimeline.d.ts.map