import type { FootieScript, StoryBackgroundMusic } from "@/features/story/types";
import type { AudioEngineSnapshot } from "../types/audio-engine.types";
import type { AudioMix, AudioTrack } from "../types/audio.types";
export type VoiceoverTrackUpdate = Partial<Pick<AudioTrack, "src" | "durationMs" | "playbackRate" | "enabled" | "metadata">>;
/** Master timeline length — voiceover duration when present, otherwise story duration. */
export declare function getMasterAudioDurationMs(story: FootieScript | null | undefined): number;
/** Normalized voiceover lane derived from canonical story fields. */
export declare function getVoiceoverTrack(story: FootieScript | null | undefined): AudioTrack | undefined;
/** Normalized background music lane — omitted when disabled or missing a URL. */
export declare function getBackgroundTrack(story: FootieScript | null | undefined): AudioTrack | undefined;
/** Builds the full audio mix snapshot from story state without mutating the story. */
export declare function buildAudioMixFromStory(story: FootieScript | null | undefined): AudioMix;
/** Returns a new story with voiceover fields updated from normalized track data. */
export declare function updateVoiceoverTrack(story: FootieScript, voiceover: VoiceoverTrackUpdate): FootieScript;
/** Returns a new story with background music settings merged and normalized. */
export declare function updateBackgroundTrack(story: FootieScript, backgroundMusic: Partial<StoryBackgroundMusic>): FootieScript;
/** Derives the shared audio snapshot from canonical story state. */
export declare function resolveAudioEngineSnapshot(script: FootieScript | null | undefined): AudioEngineSnapshot | null;
/**
 * Browser-side audio coordinator — single source of truth for voiceover and
 * background music URLs, blob cache, and preview HTMLAudioElement reuse.
 */
export declare class AudioEngine {
    private readonly blobCache;
    private readonly narrationElements;
    private readonly backgroundMusicElements;
    private readonly managedVoiceoverUrls;
    resolveSnapshot(script: FootieScript | null | undefined): AudioEngineSnapshot | null;
    hasVoiceover(script: FootieScript | null | undefined): boolean;
    getVoiceoverUrl(script: FootieScript | null | undefined): string | undefined;
    getBackgroundMusicUrl(script: FootieScript | null | undefined): string | null;
    materializeVoiceoverBase64(audioBase64: string): string;
    materializeVoiceoverBlob(blob: Blob): string;
    registerManagedVoiceoverUrl(url: string): void;
    releaseManagedVoiceoverUrls(): void;
    /** Clears cached blobs/elements and revokes a replaced voiceover blob URL. */
    revokeVoiceoverUrl(url: string | null | undefined): void;
    handleVoiceoverReplacement(options: {
        previousUrl?: string | null;
        previousManagedUrl?: string | null;
        nextUrl: string;
    }): void;
    fetchVoiceoverBlobForScript(script: FootieScript): Promise<Blob>;
    fetchVoiceoverBlobByUrl(url: string): Promise<Blob>;
    fetchBackgroundMusicBlobForScript(script: FootieScript): Promise<Blob | null>;
    fetchBackgroundMusicBlobByUrl(url: string): Promise<Blob>;
    /** Preview narration element — reused per voiceover URL. */
    getNarrationAudioElement(script: FootieScript | null | undefined): HTMLAudioElement | null;
    getNarrationAudioElementBySrc(src: string | undefined | null): HTMLAudioElement | null;
    /** Preview background music element — reused per music URL. */
    getBackgroundMusicAudioElement(script: FootieScript | null | undefined): HTMLAudioElement | null;
    getBackgroundMusicAudioElementBySrc(src: string | undefined | null): HTMLAudioElement | null;
    detachNarrationPreviewElement(url: string, element: HTMLAudioElement): void;
    detachBackgroundMusicPreviewElement(url: string, element: HTMLAudioElement): void;
    private fetchCachedBlob;
    private dropNarrationElement;
}
export declare function getAudioEngine(): AudioEngine;
/** Test-only reset. */
export declare function resetAudioEngineForTests(): void;
//# sourceMappingURL=audio-engine.service.d.ts.map