import { type SceneImageTransformPatch } from "@/features/story/utils";
import { type SceneTimelineUpdates, type TransitionTimelineUpdates } from "@/features/story/utils";
import type { FootieScene, FootieScript, SceneImage, StoryVoiceSettings } from "@/features/story/types";
export interface VoiceoverAttachment {
    voiceoverUrl: string;
    voiceoverDurationMs?: number;
    voiceSettings?: Partial<StoryVoiceSettings>;
}
/** Creates an object URL from a base64-encoded audio payload. */
export declare function createAudioBlobUrl(audioBase64: string, mimeType?: string): string;
/** Creates an object URL from a base64-encoded MP3 payload. */
export declare function createVoiceoverBlobUrl(audioBase64: string): string;
/** Resolves narration duration from an audio blob, with word-count fallback. */
export declare function resolveVoiceoverDurationFromBlob(blob: Blob, narration: string): Promise<number>;
/** Returns the best available voiceover duration for preview/export (seconds). */
export declare function getStoryVoiceoverDurationSec(script: FootieScript | null | undefined): number;
/** Updates story-level voice settings without regenerating narration or scenes. */
export declare function applyStoryVoiceSettings(script: FootieScript, patch: Partial<StoryVoiceSettings>): FootieScript;
/** Attaches generated narration audio metadata to a synced story. */
export declare function attachVoiceoverToScript(script: FootieScript, attachment: VoiceoverAttachment): FootieScript;
/**
 * Regenerates voiceover audio and metadata without refitting scenes, transitions,
 * captions, or images. Preview and export read the updated canonical voiceover URL.
 */
export declare function applyVoiceoverRegeneration(script: FootieScript, attachment: VoiceoverAttachment): FootieScript;
/**
 * Apply Changes flow: replaces voiceover audio and duration, then refits scene
 * timings proportionally. Preserves scene content, captions, media, and transitions.
 */
export declare function applyVoiceoverChanges(script: FootieScript, attachment: VoiceoverAttachment): FootieScript;
/**
 * Applies a story update, revoking and clearing any stale narration blob URL
 * when the narration text has changed.
 */
export declare function applyStoryUpdate(prev: FootieScript, next: FootieScript): FootieScript;
/**
 * Patches a scene in the story and keeps the timeline in sync.
 * Does not modify narration text or trigger AI generation.
 */
export declare function applySceneUpdate(script: FootieScript, sceneId: string, updates: SceneTimelineUpdates): FootieScript;
/**
 * Patches scene image transform metadata (pan/zoom/rotation/fit).
 * Does not change the image URL or trigger AI generation.
 */
export declare function applySceneImageSettings(script: FootieScript, sceneId: string, updates: SceneImageTransformPatch | SceneImage): FootieScript;
/** Resets pan, zoom, and rotation for one scene image by id. */
export declare function applyResetSceneImageSettings(script: FootieScript, sceneId: string): FootieScript;
/**
 * Patches scene image transform metadata (pan/zoom/rotation/fit).
 * Does not change the image URL or trigger AI generation.
 */
export declare function applySceneImageTransform(script: FootieScript, sceneId: string, transformPatch: SceneImageTransformPatch): FootieScript;
/**
 * Replaces the full scene list and rebuilds timeline items.
 * Does not modify narration text or trigger AI generation.
 */
export declare function applyScenesUpdate(script: FootieScript, scenes: FootieScene[]): FootieScript;
/**
 * Patches a transition item in the timeline. Does not modify scenes, narration,
 * captions, or voiceover — and never triggers AI generation.
 */
export declare function applyTransitionUpdate(script: FootieScript, transitionId: string, updates: TransitionTimelineUpdates): FootieScript;
/**
 * Normalizes scenes and timeline items for legacy stories missing timelineItems,
 * captionMode, or subtitleEffect. Recomputes totalDuration and keeps timeline
 * items in sync with scenes.
 *
 * Legacy defaults: captionMode → "generated", subtitleEffect → "fade-up".
 */
export declare function syncFootieScript(script: FootieScript, previous?: FootieScript): FootieScript;
//# sourceMappingURL=voiceover.d.ts.map