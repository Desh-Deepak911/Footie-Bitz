import type { FootieScript } from "@/features/story/types";
export interface PrepareStoryForExportResult {
    story: FootieScript;
    exportDurationMs: number;
    warnings: string[];
}
/**
 * Builds an export-normalized story copy without mutating editor state.
 * When voiceover audio is present with duration metadata, scene timings are
 * refitted so the export timeline matches voiceoverDurationMs.
 */
export declare function prepareStoryForExport(story: FootieScript): PrepareStoryForExportResult;
//# sourceMappingURL=export-preflight.utils.d.ts.map