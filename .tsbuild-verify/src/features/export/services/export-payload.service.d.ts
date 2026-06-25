import type { CaptionMode, FootieScene, FootieScript, SubtitleEffect, TimelineItem, TransitionEffect } from "@/features/story/types";
/**
 * Scene entry for export/render payloads.
 * Preserves original `subtitle`, `subtitleText`, and `narration` while exposing
 * resolved display settings for renderers.
 */
export interface ExportScene extends FootieScene {
    captionMode: CaptionMode;
    subtitleText: string;
    subtitleEffect: SubtitleEffect;
    /** Timed subtitle segments — populated in subtitles mode, empty in generated mode. */
    subtitleChunks: string[];
    durationMs: number;
    startMs: number;
    endMs: number;
    /**
     * Resolved on-screen caption for renderers.
     * Generated mode: full generated caption. Subtitles mode: first chunk only (not full source text).
     */
    displayCaption: string;
}
/** Maps an app scene to the export shape without dropping source caption fields. */
export declare function mapSceneToExport(scene: FootieScene): ExportScene;
/** Normalizes and enriches all scenes for export, syncing subtitles narration excerpts. */
export declare function mapScenesToExport(scenes: FootieScene[], narration: string): ExportScene[];
/** Scene entry in the ordered export/render timeline. */
export interface ExportSceneTimelineItem {
    id: string;
    type: "scene";
    scene: ExportScene;
}
/** Transition entry in the ordered export/render timeline. */
export interface ExportTransitionTimelineItem {
    id: string;
    type: "transition";
    fromSceneId: string;
    toSceneId: string;
    effect: TransitionEffect;
    durationMs: number;
}
export type ExportTimelineItem = ExportSceneTimelineItem | ExportTransitionTimelineItem;
/**
 * Full export/render payload for FootieBitz shorts.
 * Includes ordered timeline items (scenes + transitions) for future render pipelines.
 */
export interface FootieExportPayload {
    version: 1;
    title: string;
    narration: string;
    totalDuration: number;
    /** Ordered scene and transition items — primary timeline for renderers. */
    timelineItems: ExportTimelineItem[];
    /** Canonical scene list for backward-compatible scene-only render paths. */
    scenes: ExportScene[];
    voiceoverUrl?: string;
    voiceoverDurationMs?: number;
    /** True when scenes carry measured voiceover timing (audio-first pipeline). */
    audioFirst?: boolean;
    /**
     * When false, renderers should ignore transition items and render scenes only.
     * Set to false until canvas transition rendering is implemented.
     */
    renderTransitions: boolean;
}
export declare function isExportSceneTimelineItem(item: ExportTimelineItem): item is ExportSceneTimelineItem;
export declare function isExportTransitionTimelineItem(item: ExportTimelineItem): item is ExportTransitionTimelineItem;
/** True when text is transition connector copy — must never appear in exported video. */
export declare function isTransitionVideoContent(text: string | undefined): boolean;
/** Only scene timeline items may become video segments. */
export declare function isVideoSegmentTimelineItem(item: ExportTimelineItem): item is ExportSceneTimelineItem;
/** Safety guard — transition items must never be rendered as standalone video content. */
export declare function assertTimelineItemIsNotVideoSegment(item: TimelineItem): void;
/** Scene timeline items only, in playback order. */
export declare function getSceneTimelineItemsFromExport(payload: FootieExportPayload): ExportSceneTimelineItem[];
/** Maps app timeline items to the export payload shape. */
export declare function mapTimelineItemsToExport(items: TimelineItem[], exportScenes: ExportScene[]): ExportTimelineItem[];
/** Export duration in seconds — scene timeline when ms timing is present. */
export declare function getExportTotalDurationSec(payload: FootieExportPayload): number;
/** Scene timeline entries that become video segments (never transition cards). */
export declare function isExportSceneVideoSegment(scene: ExportScene): boolean;
/** Formats scene timing for export logs and render progress. */
export declare function formatExportSceneTiming(scene: ExportScene): string;
/** Builds the ordered export payload from a synced FootieScript. */
export declare function buildFootieExportPayload(script: FootieScript): FootieExportPayload;
/** Scene items from the export timeline in playback order. */
export declare function getExportScenesFromPayload(payload: FootieExportPayload): ExportScene[];
/** Transition items from the export timeline. Safe to ignore when renderTransitions is false. */
export declare function getExportTransitionsFromPayload(payload: FootieExportPayload): ExportTransitionTimelineItem[];
/**
 * Returns scenes for video/export rendering.
 * Only timeline items with type "scene" become segments — transitions are skipped
 * until canvas transition rendering is implemented.
 */
export declare function getRenderableScenesFromPayload(payload: FootieExportPayload): ExportScene[];
/** Counts transition items included in the payload (for UI/logging). */
export declare function countExportTransitions(payload: FootieExportPayload): number;
/** Validates the export payload before rendering. */
export declare function assertExportPayload(payload: FootieExportPayload): void;
//# sourceMappingURL=export-payload.service.d.ts.map