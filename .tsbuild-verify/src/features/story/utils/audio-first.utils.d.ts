import type { AudioFirstGenerationResult, StoryScript, VoiceoverDurationSource, VoiceoverMetadata, VoiceoverProvider, VoiceoverResult } from "@/features/story/types/audio-first.types";
import type { FootieScene, FootieScript } from "@/features/story/types";
export { estimateNarrationDurationMs } from "@/lib/audio";
export declare function resolveVoiceoverDurationMs(mp3: ArrayBuffer, narration: string): {
    durationMs: number;
    durationSource: VoiceoverDurationSource;
};
export declare function secondsToMs(seconds: number): number;
export declare function msToSeconds(ms: number): number;
/** Adds millisecond timing fields derived from second-based scene timing. */
export declare function withSceneTimingMs(scene: FootieScene): FootieScene;
export declare function withScenesTimingMs(scenes: FootieScene[]): FootieScene[];
export declare function createStoryScriptId(): string;
export declare function toStoryScript(script: FootieScript, id?: string): StoryScript;
export declare function toVoiceoverResultFromMp3(mp3: ArrayBuffer, options?: {
    provider?: VoiceoverProvider;
    voice?: string;
    speed?: number;
    audioBase64?: string;
    audioUrl?: string;
    narration?: string;
    metadata?: VoiceoverMetadata;
}): VoiceoverResult;
export declare function buildAudioFirstGenerationResult(story: FootieScript, voiceover: VoiceoverResult | null, scriptId?: string): AudioFirstGenerationResult;
export declare function footieScriptFromAudioFirst(result: AudioFirstGenerationResult): FootieScript;
//# sourceMappingURL=audio-first.utils.d.ts.map