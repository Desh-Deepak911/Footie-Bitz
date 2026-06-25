import type { FootieScene, SceneImage, SceneImageFitMode, SceneImageMotion, SceneImageMotionIntensity, SceneImageMotionType } from "@/features/story/types";
export declare const DEFAULT_IMAGE_SCALE = 1;
export declare const MIN_SCENE_IMAGE_SCALE = 0.5;
export declare const MAX_SCENE_IMAGE_SCALE = 3;
export declare const DEFAULT_IMAGE_FIT_MODE: SceneImageFitMode;
export declare const DEFAULT_IMAGE_MOTION_TYPE: SceneImageMotionType;
export declare const DEFAULT_IMAGE_MOTION_INTENSITY: SceneImageMotionIntensity;
export declare const SCENE_IMAGE_MOTION_TYPE_OPTIONS: {
    value: SceneImageMotionType;
    label: string;
}[];
export declare const SCENE_IMAGE_MOTION_INTENSITY_OPTIONS: {
    value: SceneImageMotionIntensity;
    label: string;
}[];
/** Canonical 9:16 frame used to store pan offsets independent of preview/export size. */
export declare const SCENE_IMAGE_REFERENCE_WIDTH = 1080;
export declare const SCENE_IMAGE_REFERENCE_HEIGHT = 1920;
export type SceneImageTransformPatch = Partial<Pick<SceneImage, "scale" | "x" | "y" | "rotation" | "fitMode">> & {
    imageMotion?: Partial<SceneImageMotion>;
};
/** Default image motion values for newly attached scene images. */
export declare function getDefaultImageMotion(): SceneImageMotion;
export declare function normalizeSceneImageMotionType(value: unknown): SceneImageMotionType;
export declare function normalizeSceneImageMotionIntensity(value: unknown): SceneImageMotionIntensity;
export declare function normalizeSceneImageMotion(value: unknown): SceneImageMotion;
/** Default pan/zoom values for a newly attached scene image. */
export declare function getDefaultImageTransform(): Pick<SceneImage, "scale" | "x" | "y" | "rotation" | "fitMode">;
export declare function clampSceneImageScale(scale: number): number;
/** Maps a pan/zoom axis from reference space into a target frame size. */
export declare function scaleSceneImageAxisForFrame(value: number, frameSize: number, referenceSize: number): number;
/** Maps screen-space pan from a UI frame into reference-space storage. */
export declare function sceneImagePanToReferenceSpace(panX: number, panY: number, frameWidth: number, frameHeight: number): {
    x: number;
    y: number;
};
/** Resolves stored transform metadata for a specific render frame. */
export declare function resolveSceneImageTransformForFrame(image: SceneImage, frameWidth: number, frameHeight: number): SceneImage;
export declare function normalizeSceneImageFitMode(value: unknown): SceneImageFitMode;
/** Switches fit mode and clears pan offset so the new framing starts centered. */
export declare function applySceneImageFitMode(image: SceneImage, fitMode: SceneImageFitMode): SceneImage;
/** Resets pan, zoom, and rotation while preserving URL, fit mode, and motion settings. */
export declare function resetSceneImageTransform(image: SceneImage): SceneImage;
/**
 * Normalizes legacy string URLs and partial image objects into `SceneImage`.
 * Returns `undefined` when no usable URL is present.
 */
export declare function normalizeSceneImage(image: unknown, legacyUrl?: string): SceneImage | undefined;
/** Returns the image URL for display/export, supporting legacy `uploadedImage`. */
export declare function getSceneImageUrl(scene: Pick<FootieScene, "image" | "uploadedImage">): string | undefined;
/** Returns the normalized scene image, if any. */
export declare function getSceneImage(scene: Pick<FootieScene, "image" | "uploadedImage">): SceneImage | undefined;
export declare function sceneHasImage(scene: Pick<FootieScene, "image" | "uploadedImage">): boolean;
export declare function sceneImagesEqual(left: Pick<FootieScene, "image" | "uploadedImage">, right: Pick<FootieScene, "image" | "uploadedImage">): boolean;
/** Applies a transform patch to a scene's image, if present. */
export declare function patchSceneImageTransform(scene: Pick<FootieScene, "image" | "uploadedImage">, patch: SceneImageTransformPatch): SceneImage | undefined;
/** Adds a screen-space drag delta to stored reference-space pan values. */
export declare function applyReferencePanFromScreenDelta(originX: number, originY: number, screenDeltaX: number, screenDeltaY: number, frameWidth: number, frameHeight: number): {
    x: number;
    y: number;
};
/** Applies a live screen-space drag offset on top of stored reference-space pan. */
export declare function withScreenDragOffset(image: SceneImage, screenOffset: {
    x: number;
    y: number;
}, frameWidth: number, frameHeight: number): SceneImage;
/** Resolves scene image metadata for export, including legacy string URLs. */
export declare function resolveExportSceneImage(scene: Pick<FootieScene, "image" | "uploadedImage">): SceneImage | undefined;
/** Migrates legacy `uploadedImage` strings to `image` and applies transform defaults. */
export declare function normalizeSceneImageSettings(scene: FootieScene): FootieScene;
/** Applies caption + image normalization for load/sync paths. */
export declare function normalizeSceneSettings(scene: FootieScene): FootieScene;
/** Patches transform metadata on a scene image without changing the URL. */
export declare function updateSceneImageSettings(scenes: FootieScene[], sceneId: string, updates: SceneImageTransformPatch | SceneImage): FootieScene[];
/** Resets pan, zoom, and rotation for one scene image by id. */
export declare function resetSceneImageSettings(scenes: FootieScene[], sceneId: string): FootieScene[];
/** Patches transform metadata on a scene image without changing the URL. */
export declare function updateSceneImageTransform(scenes: FootieScene[], sceneId: string, transformPatch: SceneImageTransformPatch): FootieScene[];
/** CSS object-fit mode from normalized scene image data. */
export declare function getSceneImageObjectFit(image: SceneImage): "cover" | "contain";
/** Builds the CSS transform string: translate → scale → rotate. */
export declare function getSceneImageTransformCss(image: SceneImage, motionScale?: number): string;
/** Inline styles for a transformed scene image inside a clipped frame. */
export declare function getSceneImageTransformStyle(image: SceneImage, frameWidth?: number, frameHeight?: number, motionScale?: number): {
    transform: string;
    transformOrigin: "center center";
};
export interface SceneImageDrawDimensions {
    drawWidth: number;
    drawHeight: number;
}
/** Cover dimensions for drawing a bitmap inside a frame (default visual). */
export declare function getSceneImageCoverDimensions(imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number): SceneImageDrawDimensions;
/** Contain dimensions for `fitMode: "fit"`. */
export declare function getSceneImageContainDimensions(imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number): SceneImageDrawDimensions;
export declare function getSceneImageDrawDimensions(image: SceneImage, imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number): SceneImageDrawDimensions;
/** Draws a scene image inside a clipped frame using normalized transform metadata. */
export declare function drawSceneImageInFrame(ctx: CanvasRenderingContext2D, bitmap: CanvasImageSource, frameWidth: number, frameHeight: number, image: SceneImage, sourceWidth: number, sourceHeight: number, motionScale?: number): void;
/** Creates a scene image from a newly uploaded URL with default transform values. */
export declare function createSceneImageFromUrl(url: string): SceneImage;
/** Returns an independent copy of scene image settings (same URL, new object). */
export declare function cloneSceneImage(image: SceneImage): SceneImage;
export declare function normalizeSceneTiming(scenes: FootieScene[]): FootieScene[];
export interface SceneTimingSlot {
    sceneId: string;
    index: number;
    startMs: number;
    endMs: number;
    durationMs: number;
}
/** Resolves one scene's playback duration from editor timing fields. */
export declare function resolveSceneDurationMsForTiming(scene: FootieScene): number;
/** Builds sequential scene windows from current per-scene durations. */
export declare function getSceneTimingMap(scenes: FootieScene[]): SceneTimingSlot[];
/** Returns the scene active at a timeline position based on accumulated durations. */
export declare function getActiveSceneAtTime(scenes: FootieScene[], currentTimeMs: number): SceneTimingSlot | null;
/** Resolves active scene timing at a global playback position (preview + export). */
export declare function getSceneTimingAtGlobalTime(scenes: FootieScene[], currentTimeMs: number): {
    slot: SceneTimingSlot;
    sceneElapsedMs: number;
    sceneDurationMs: number;
} | null;
export declare function getStoryTotalDuration(scenes: FootieScene[]): number;
export declare function getSceneDurationMs(scene: FootieScene | null | undefined): number;
export declare function getSceneStartMs(scene: FootieScene | null | undefined): number;
export declare function getSceneEndMs(scene: FootieScene | null | undefined): number;
/** Elapsed milliseconds within a scene at a global timeline position. */
export declare function getSceneElapsedMs(currentTimeSec: number, scene: FootieScene): number;
export declare function scenesHaveMsTiming(scenes: FootieScene[]): boolean;
export declare function getSceneIndexForTime(currentTimeSec: number, scenes: FootieScene[]): number;
//# sourceMappingURL=scene.utils.d.ts.map