import type { SceneImageMotion, SceneImageMotionIntensity } from "@/features/story/types";
/** Peak scale multiplier at the end of zoom-in / start of zoom-out by intensity. */
export declare const SCENE_IMAGE_MOTION_INTENSITY_MAX_SCALE: Record<SceneImageMotionIntensity, number>;
/** Scene-local progress for image motion (0 at scene start, 1 at scene end). */
export declare function resolveSceneImageMotionProgress(sceneElapsedMs: number, sceneDurationMs: number): number;
/** Additional scale multiplier applied on top of manual pan/zoom during playback. */
export declare function resolveSceneImageMotionScale(motion: SceneImageMotion | undefined, progress: number): number;
//# sourceMappingURL=scene-image-motion.utils.d.ts.map