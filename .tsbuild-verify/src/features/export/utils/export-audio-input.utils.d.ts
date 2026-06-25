import type { AudioTrack } from "@/features/audio/types/audio.types";
export interface ExportNormalizedAudioInput {
    blob: Blob;
    mimeType: string;
    extension: string;
    fileName: string;
}
export interface ExportAudioInputPayload {
    blob?: Blob | File;
    src?: string;
    base64?: string;
    fileName?: string;
    mimeType?: string;
    /** Virtual filename prefix when no fileName is provided. Defaults to `audio`. */
    fallbackBaseName?: string;
}
export type ExportAudioInput = Blob | File | string | AudioTrack | ExportAudioInputPayload;
/** Maps a MIME type to a supported FFmpeg input extension. */
export declare function resolveExportAudioExtensionFromMime(mimeType: string): string;
/** Maps a supported file name extension to MIME type for export/draft hydration. */
export declare function inferExportAudioMimeTypeFromFileName(fileName: string | undefined): string | null;
/** Resolves export MIME from explicit hint, file name, or blob metadata. */
export declare function resolveExportAudioMimeType(options: {
    blobType?: string;
    fileName?: string;
    explicitMimeType?: string;
}): string;
/**
 * Normalizes export audio into FFmpeg-ready bytes.
 * Accepts blobs, files, object URLs, HTTP URLs, base64, data URLs, and audio tracks.
 */
export declare function normalizeExportAudioInput(audioTrack: ExportAudioInput): Promise<ExportNormalizedAudioInput>;
/** Virtual FFmpeg filename for a normalized voiceover input. */
export declare function buildFfmpegVoiceInputFilename(extension: string): string;
/** Virtual FFmpeg filename for a normalized background music input. */
export declare function buildFfmpegMusicInputFilename(extension: string): string;
//# sourceMappingURL=export-audio-input.utils.d.ts.map