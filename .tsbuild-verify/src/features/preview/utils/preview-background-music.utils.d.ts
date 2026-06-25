import type { FootieScript } from "@/features/story/types";
export declare const PREVIEW_MUSIC_DUCKING_MULTIPLIER = 0.35;
export declare const PREVIEW_BACKGROUND_MUSIC_FADE_IN_SEC = 2;
export declare const PREVIEW_BACKGROUND_MUSIC_FADE_OUT_SEC = 2;
export declare function resolvePreviewBackgroundMusicUrl(script: FootieScript | null | undefined): string | null;
export declare function isPreviewBackgroundMusicActive(script: FootieScript | null | undefined): boolean;
export declare function computePreviewBackgroundMusicFadeMultiplier(elapsedSec: number, totalDurationSec: number, fadeIn: boolean, fadeOut: boolean): number;
export declare function computePreviewBackgroundMusicVolume(options: {
    baseVolume: number;
    duckingEnabled: boolean;
    voiceoverIsPlaying: boolean;
    fadeMultiplier: number;
}): number;
export declare function resolvePreviewBackgroundMusicPlaybackVolume(options: {
    script: FootieScript | null | undefined;
    elapsedSec: number;
    totalDurationSec: number;
    voiceoverIsPlaying: boolean;
}): number;
//# sourceMappingURL=preview-background-music.utils.d.ts.map