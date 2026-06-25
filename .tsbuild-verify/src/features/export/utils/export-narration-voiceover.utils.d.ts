import type { FootieScript } from "@/features/story/types";
export declare const EXPORT_NARRATION_VOICEOVER_MISMATCH_WARNING = "Narration changed after voiceover generation. Regenerate voiceover before exporting for best sync.";
/** True when voiceover exists but story or scene narration no longer matches the generated snapshot. */
export declare function hasNarrationVoiceoverMismatch(story: FootieScript): boolean;
export declare function resolveNarrationVoiceoverMismatchWarning(story: FootieScript): string | undefined;
//# sourceMappingURL=export-narration-voiceover.utils.d.ts.map