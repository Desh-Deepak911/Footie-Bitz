import type { FootieScript } from "@/features/story/types";
import { getAudioEngine } from "../services/audio-engine.service";
import type { AudioEngineSnapshot } from "../types/audio-engine.types";
export interface UseAudioEngineResult {
    engine: ReturnType<typeof getAudioEngine>;
    snapshot: AudioEngineSnapshot | null;
    hasVoiceover: boolean;
    voiceoverUrl: string | undefined;
    backgroundMusicUrl: string | null;
}
/**
 * React hook for the shared AudioEngine snapshot derived from FootieScript.
 * Preview, export, and voice apply flows should read audio URLs through this hook
 * or getAudioEngine() directly — not from ad hoc script field reads.
 */
export declare function useAudioEngine(script: FootieScript | null | undefined): UseAudioEngineResult;
//# sourceMappingURL=useAudioEngine.d.ts.map