import type { ExportSettings, FootieScript } from "@/features/story/types";
export interface SerializeEditorStateOptions {
    /** Latest export panel values — may live outside `script` until save. */
    exportSettings?: ExportSettings;
}
/**
 * Prepares the full editor story for JSON/localStorage persistence.
 * Normalizes timeline, voice/background/export settings, and deep-clones so
 * scenes, transitions, captions, image transforms, and durations are preserved.
 */
export declare function serializeEditorStateForDraft(script: FootieScript, options?: SerializeEditorStateOptions): FootieScript;
/**
 * Serializes editor state and embeds JSON-safe base64 audio for voiceover and
 * uploaded background music so drafts survive reload.
 */
export declare function serializeEditorStateForDraftAsync(script: FootieScript, options?: SerializeEditorStateOptions): Promise<FootieScript>;
/** Returns true when a value can be persisted with JSON.stringify. */
export declare function isJsonSerializable(value: unknown): boolean;
//# sourceMappingURL=draft-serialization.utils.d.ts.map