import { type PreviewSceneFrame } from "@/features/preview/utils";
import type { FootieScript } from "@/features/story/types";
export type PlaybackMode = "browser" | "narration";
export interface UsePreviewPlaybackOptions {
    script: FootieScript | null;
    selectedSceneIndex: number;
    onSelectedSceneChange: (index: number) => void;
}
export declare function usePreviewPlayback({ script, selectedSceneIndex, onSelectedSceneChange, }: UsePreviewPlaybackOptions): {
    scenes: import("@/features/story/types").FootieScene[];
    sceneCount: number;
    totalDuration: number;
    safeIndex: number;
    hasNarration: boolean;
    isPlaying: boolean;
    isSpeaking: boolean;
    playbackMode: PlaybackMode | null;
    elapsedSec: number;
    previewFrame: PreviewSceneFrame | null;
    activeSceneIndex: number;
    progressPct: number;
    isClient: boolean;
    voices: SpeechSynthesisVoice[];
    selectedVoiceURI: string;
    setSelectedVoiceURI: import("react").Dispatch<import("react").SetStateAction<string>>;
    speechRate: number;
    setSpeechRate: import("react").Dispatch<import("react").SetStateAction<number>>;
    speechPitch: number;
    setSpeechPitch: import("react").Dispatch<import("react").SetStateAction<number>>;
    speechVolume: number;
    setSpeechVolume: import("react").Dispatch<import("react").SetStateAction<number>>;
    previewClockMs: number;
    browserSceneStartedAtMs: number | null;
    timelineItems: import("@/features/story/types").TimelineItem[];
    scene: import("@/features/story/types").FootieScene;
    playPreview: () => Promise<void>;
    playWithBrowserVoice: () => void;
    pauseVoice: () => void;
    stopVoice: () => void;
    goPrevious: () => void;
    goNext: () => void;
};
//# sourceMappingURL=usePreviewPlayback.d.ts.map