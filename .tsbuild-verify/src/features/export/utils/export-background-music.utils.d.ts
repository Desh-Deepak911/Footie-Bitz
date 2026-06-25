import type { AudioMix } from "@/features/audio";
import type { StoryBackgroundMusic } from "@/features/story/types";
import { getStoryBackgroundMusic } from "@/features/story/utils";
/** Attempt browser export mixing when background music is enabled. */
export declare const EXPORT_BACKGROUND_MUSIC_MIXING_ENABLED = true;
export declare const EXPORT_BACKGROUND_MUSIC_FALLBACK_WARNING = "Background music plays in preview but was not merged into this WebM export. Choose MP4 or disable background music to avoid this.";
/** @deprecated Use EXPORT_AUDIO_VOICE_ONLY_FALLBACK_MESSAGE */
export declare const EXPORT_BACKGROUND_MUSIC_PARTIAL_FALLBACK_WARNING = "Background music could not be merged. Exported voiceover only.";
export declare const EXPORT_AUDIO_FULL_SUCCESS_MESSAGE = "Merged voiceover and music successfully.";
export declare const EXPORT_AUDIO_VOICE_ONLY_FALLBACK_MESSAGE = "Background music could not be merged. Exported with voiceover only.";
/** User-facing warning when export falls back to voiceover-only after music merge failure. */
export declare const EXPORT_AUDIO_VOICE_ONLY_FALLBACK_WARNING = "Background music could not be merged. Exported with voiceover only.";
export declare const EXPORT_AUDIO_SILENT_FALLBACK_MESSAGE = "Audio merge failed. Exported silent video.";
export interface ExportBackgroundMusicMixSettings {
    /** Normalized export timeline length from prepareStoryForExport. */
    exportDurationMs: number;
    volume: number;
    fadeIn: boolean;
    fadeOut: boolean;
    fadeInSec: number;
    fadeOutSec: number;
}
/** Converts preflight export duration to seconds for FFmpeg/browser mix. */
export declare function resolveExportBackgroundMusicDurationSec(exportDurationMs: number): number;
export declare function isExportBackgroundMusicActive(script: Parameters<typeof getStoryBackgroundMusic>[0]): boolean;
/** True when the normalized audio mix includes playable background music. */
export declare function isExportBackgroundMusicActiveFromMix(audioMix: AudioMix): boolean;
export declare function resolveExportBackgroundMusicBedVolume(music: StoryBackgroundMusic, _includeNarration: boolean): number;
export declare function resolveExportBackgroundMusicMixSettings(script: Parameters<typeof getStoryBackgroundMusic>[0], includeNarration: boolean, exportDurationMs: number): ExportBackgroundMusicMixSettings | null;
/** Builds FFmpeg mix settings from a normalized story audio mix. */
export declare function resolveExportBackgroundMusicMixSettingsFromMix(audioMix: AudioMix, includeNarration: boolean, exportDurationMs: number): ExportBackgroundMusicMixSettings | null;
/** Normalizes export audio streams to a common sample rate/layout before amix. */
export declare const EXPORT_FFMPEG_AUDIO_FORMAT_FILTERS: readonly ["aresample=48000", "aformat=sample_fmts=fltp:channel_layouts=stereo"];
export declare function buildExportBackgroundMusicFilterChain(inputIndex: number, settings: ExportBackgroundMusicMixSettings, outputLabel: string): string;
export declare function resolveBackgroundMusicInputFilename(blob: Blob, fileName?: string): string;
//# sourceMappingURL=export-background-music.utils.d.ts.map