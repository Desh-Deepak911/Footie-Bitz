import type { FootieScript, StoryBackgroundMusic } from "@/features/story/types";
export declare const DEFAULT_BACKGROUND_MUSIC_VOLUME = 0.18;
/** Normalizes story background music with safe defaults for legacy stories. */
export declare function normalizeStoryBackgroundMusic(partial?: Partial<StoryBackgroundMusic> | null): StoryBackgroundMusic;
/** Returns normalized background music settings with defaults applied. */
export declare function getStoryBackgroundMusic(script: FootieScript | null | undefined): StoryBackgroundMusic;
export declare function volumeToPercent(volume: number): number;
export declare function percentToVolume(percent: number): number;
/** Updates story-level background music without touching voiceover or scenes. */
export declare function applyStoryBackgroundMusic(script: FootieScript, patch: Partial<StoryBackgroundMusic>): FootieScript;
//# sourceMappingURL=background-music.utils.d.ts.map