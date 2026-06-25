import type { FootieScene, TimelineItem } from "./story.types";
/** Narration script produced before or during audio-first timing. */
export interface StoryScript {
    id: string;
    title: string;
    narration: string;
    /** Target length from generation before voiceover measurement. */
    estimatedDurationMs?: number;
}
export declare const VOICEOVER_PROVIDER_OPENAI: "openai";
export type VoiceoverProvider = typeof VOICEOVER_PROVIDER_OPENAI | (string & {});
export type VoiceoverDurationSource = "measured" | "estimated";
export interface VoiceoverMetadata {
    voice?: string;
    speed?: number;
    model?: string;
    format?: "audio/mpeg";
    durationSource?: VoiceoverDurationSource;
}
/**
 * Voiceover output from TTS. Uses `audioBase64` on the server response and
 * `audioUrl` after the client materializes a blob URL.
 */
export interface VoiceoverResult {
    durationMs: number;
    provider: VoiceoverProvider;
    audioBase64?: string;
    audioUrl?: string;
    metadata?: VoiceoverMetadata;
}
/** Full result of the audio-first generation pipeline. */
export interface AudioFirstGenerationResult {
    script: StoryScript;
    voiceover: VoiceoverResult | null;
    scenes: FootieScene[];
    timelineItems: TimelineItem[];
}
//# sourceMappingURL=audio-first.types.d.ts.map