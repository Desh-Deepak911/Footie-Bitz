/** Browser-only FFmpeg audio merge diagnostics for export failures. */
export interface FfmpegInputFileDiagnostics {
    filename: string;
    mimeType: string;
    size: number;
}
export interface FfmpegAudioMergeFailureDiagnostics {
    exitCode?: number;
    command: string;
    video: FfmpegInputFileDiagnostics;
    voiceover: FfmpegInputFileDiagnostics | null;
    backgroundMusic: FfmpegInputFileDiagnostics | null;
    stdout: string;
    stderr: string;
}
type FfmpegLogEvent = {
    type: string;
    message: string;
};
export interface FfmpegLogCapture {
    stdout: string;
    stderr: string;
    handleLog: (event: FfmpegLogEvent) => void;
}
export declare function describeFfmpegInputBlob(filename: string, blob: Blob): FfmpegInputFileDiagnostics;
export declare function describeNormalizedFfmpegInput(filename: string, normalized: {
    mimeType: string;
    blob: Blob;
}): FfmpegInputFileDiagnostics;
/** Formats the argv array passed to `ffmpeg.exec()` as a single shell-like command. */
export declare function formatFfmpegExecCommand(args: readonly string[]): string;
/** Accumulates FFmpeg log events without truncation. */
export declare function createFfmpegLogCapture(): FfmpegLogCapture;
/** Writes a complete, untruncated diagnostic dump when export audio merge fails. */
export declare function logFfmpegAudioMergeFailure(diagnostics: FfmpegAudioMergeFailureDiagnostics): void;
export {};
//# sourceMappingURL=ffmpeg-export-diagnostics.utils.d.ts.map