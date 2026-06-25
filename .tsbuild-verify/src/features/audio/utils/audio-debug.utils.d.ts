import type { FootieScript } from "@/features/story/types";
import type { AudioMix } from "../types/audio.types";
export declare function isAudioDebugEnabled(): boolean;
export interface AudioEngineDebugState {
    voiceoverExists: boolean;
    voiceoverSrcType: string;
    voiceoverDurationMs?: number;
    backgroundMusicEnabled: boolean;
    backgroundMusicExists: boolean;
    masterDurationMs: number;
    exportAudioSource: string;
}
/** Classifies an audio reference without logging URL or payload content. */
export declare function classifyAudioSrcType(src: string | undefined): string;
export declare function resolveExportAudioSource(mix: AudioMix): string;
export declare function getAudioEngineDebugState(story: FootieScript | null | undefined): AudioEngineDebugState | null;
/** Logs normalized audio mix state when `NEXT_PUBLIC_AUDIO_DEBUG=true`. */
export declare function logAudioEngineState(story: FootieScript | null | undefined, context?: string): void;
//# sourceMappingURL=audio-debug.utils.d.ts.map