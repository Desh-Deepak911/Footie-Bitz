/** Estimates spoken narration length from word count. */
export declare function estimateNarrationDurationMs(text: string): number;
/**
 * Returns measured audio duration in milliseconds when metadata is available.
 * In the browser, prefers HTMLAudioElement metadata; falls back to MP3 frame parsing for blobs.
 * Outside the browser, MP3 frame parsing is used for Blob input only.
 */
export declare function getAudioDurationMs(audioUrlOrBlob: string | Blob): Promise<number | null>;
//# sourceMappingURL=audio-duration.utils.d.ts.map