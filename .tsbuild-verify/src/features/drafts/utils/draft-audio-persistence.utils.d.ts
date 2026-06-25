import type { FootieScript, StoryBackgroundMusic } from "@/features/story/types";
/** Optional persisted audio payloads stored on draft scripts (JSON-safe). */
export type DraftPersistedScript = FootieScript & {
    voiceoverAudioBase64?: string;
};
export type DraftPersistedBackgroundMusic = StoryBackgroundMusic & {
    fileDataBase64?: string;
    fileMimeType?: string;
};
/** Embeds JSON-safe base64 audio payloads for voiceover and uploaded background music. */
export declare function persistDraftAudioInScript(script: FootieScript): Promise<DraftPersistedScript>;
/** Restores playable blob URLs from persisted draft audio payloads. */
export declare function hydrateDraftScriptAudio(script: FootieScript): FootieScript;
//# sourceMappingURL=draft-audio-persistence.utils.d.ts.map