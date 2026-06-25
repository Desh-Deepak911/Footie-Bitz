import type { ExportBackgroundMusicMixSettings } from "./export-background-music.utils";
import { type ExportAudioInput } from "./export-audio-input.utils";
/** Browser-only FFmpeg.wasm helpers. Import dynamically from client export code. */
type FFmpegInstance = import("@ffmpeg/ffmpeg").FFmpeg;
export declare function isBrowserEnvironment(): boolean;
export declare function isFFmpegLoaded(): boolean;
/**
 * Returns a singleton FFmpeg.wasm instance loaded in the browser.
 * Safe to import from client components; throws if called during SSR.
 */
export declare function getFFmpeg(): Promise<FFmpegInstance>;
/**
 * Terminates the singleton FFmpeg.wasm worker and clears module-level state so the
 * next `getFFmpeg()` call loads a fresh instance with a clean virtual filesystem.
 * Use after a failed combined audio mux before running voice-only fallback.
 */
export declare function resetFFmpeg(): Promise<void>;
export type ExportAudioMuxOutputFormat = "webm" | "mp4";
export declare function isMp4ExportBlob(blob: Blob): boolean;
export interface MuxVideoWithAudioOptions {
    /** Target output duration in seconds (matches rendered video length). */
    videoDurationSec: number;
    /** FFmpeg mux progress from 0–100, when available. */
    onProgress?: (progress: number) => void;
    /** Defaults to webm (stream-copy video). */
    outputFormat?: ExportAudioMuxOutputFormat;
}
export interface MuxVideoWithExportAudioOptions extends MuxVideoWithAudioOptions {
    voiceoverInput?: ExportAudioInput;
    backgroundMusicInput?: ExportAudioInput;
    backgroundMusicMix?: ExportBackgroundMusicMixSettings;
    /**
     * WebM mux stream-copies canvas video (fast path).
     * MP4 mux encodes H.264 + AAC in the same pass — avoids a second transcode exec.
     */
    outputFormat?: ExportAudioMuxOutputFormat;
}
/**
 * Muxes a silent WebM video with optional narration and background music.
 * Combined export uses a simplified volume-only mix graph for FFmpeg.wasm stability.
 */
export declare function muxVideoWithExportAudio(videoBlob: Blob, options: MuxVideoWithExportAudioOptions): Promise<Blob>;
/**
 * Muxes a silent WebM video with a narration track in the browser.
 * Output length follows the video: shorter audio is padded with silence,
 * longer audio is trimmed to the video duration.
 */
export declare function muxVideoWithAudio(videoBlob: Blob, voiceoverInput: ExportAudioInput, options: MuxVideoWithAudioOptions): Promise<Blob>;
/**
 * Muxes silent canvas WebM with pre-encoded Opus/WebM mixed audio.
 * Stream-copies both video and audio — no libopus re-encode in FFmpeg.wasm.
 */
export declare function muxVideoWithStreamCopiedWebmAudio(videoBlob: Blob, preMixedAudioInput: ExportAudioInput, options: MuxVideoWithAudioOptions): Promise<Blob>;
export interface TranscodeWebmToMp4Options {
    /** Whether the input includes an audio track to preserve. */
    hasAudio?: boolean;
    onProgress?: (progress: number) => void;
}
/**
 * Converts a silent WebM export blob to MP4 (H.264, no audio).
 * Used for MP4 exports without narration — audio mux uses single-pass MP4 output instead.
 */
export declare function transcodeWebmToMp4(videoBlob: Blob, options?: TranscodeWebmToMp4Options): Promise<Blob>;
export {};
//# sourceMappingURL=ffmpeg.utils.d.ts.map