import { type ExportAudioInput } from "./export-audio-input.utils";
import { type ExportBackgroundMusicMixSettings } from "./export-background-music.utils";
export declare const EXPORT_BROWSER_MIX_SAMPLE_RATE = 48000;
export declare const EXPORT_BROWSER_MIX_CHANNELS = 2;
export declare const EXPORT_BROWSER_MIXED_AUDIO_FILENAME = "mixed-audio.webm";
export interface ExportBrowserAudioMixOptions {
    voiceoverInput: ExportAudioInput;
    backgroundMusicInput: ExportAudioInput;
    mixSettings: ExportBackgroundMusicMixSettings;
}
export interface ExportBrowserAudioMixResult {
    blob: Blob;
    mimeType: "audio/webm";
    fileName: typeof EXPORT_BROWSER_MIXED_AUDIO_FILENAME;
}
/** Preferred MediaRecorder MIME for export mixed audio (Opus in WebM). */
export declare function resolveExportBrowserMixRecorderMimeType(): string | null;
export declare function isBrowserExportAudioMixSupported(): boolean;
/** Encodes a rendered AudioBuffer as 16-bit PCM WAV (test helper). */
export declare function encodeAudioBufferToWavBlob(buffer: AudioBuffer): Blob;
/**
 * Records a mixed AudioBuffer to compressed Opus/WebM via MediaRecorder.
 * Playback runs in real time while the stream is captured.
 */
export declare function encodeAudioBufferToWebmOpusBlob(buffer: AudioBuffer): Promise<Blob>;
/**
 * Mixes voiceover and background music in the browser, then encodes Opus/WebM
 * for FFmpeg stream-copy muxing (avoids large PCM WAV + libopus re-encode).
 */
export declare function mixExportVoiceoverAndBackgroundMusic(options: ExportBrowserAudioMixOptions): Promise<ExportBrowserAudioMixResult>;
//# sourceMappingURL=export-browser-audio-mix.utils.d.ts.map