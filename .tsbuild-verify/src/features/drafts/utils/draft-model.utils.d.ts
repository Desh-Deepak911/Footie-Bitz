import type { FootieScript } from "@/features/story/types";
import type { Draft, DraftEditorSlices, DraftVoiceover, StoryCreationBrief, StoryDraftSummary } from "../types";
export declare function voiceoverFromScript(script: FootieScript): DraftVoiceover | undefined;
export declare function applyVoiceoverToScript(script: FootieScript, voiceover?: DraftVoiceover): FootieScript;
/** Extracts denormalized editor slices from the canonical script. */
export declare function extractEditorSlicesFromScript(script: FootieScript): DraftEditorSlices;
/** Applies denormalized editor slices onto a script without dropping other script fields. */
export declare function applyEditorSlicesToScript(script: FootieScript, slices: DraftEditorSlices): FootieScript;
export declare function buildDraftSummaryFields(script: FootieScript): {
    sceneCount: number;
    totalDuration: number;
    hasVoiceover: boolean;
};
/**
 * Normalizes a draft so `script` remains canonical and top-level editor slices match it.
 * Fills defaults for list metadata and lifecycle fields.
 */
export declare function normalizeDraft(input: Partial<Draft> & Pick<Draft, "id" | "script">): Draft;
/** Upgrades persisted records that predate the full Draft shape. */
export declare function coerceLegacyDraft(stored: Partial<Draft> & Pick<Draft, "id" | "script">): Draft;
export declare function draftToScript(draft: Draft): FootieScript;
export declare function toDraftSummary(draft: Draft): StoryDraftSummary;
export declare function createDraftFromScript(script: FootieScript, creationBrief?: StoryCreationBrief, id?: string): Draft;
export declare function touchDraft(draft: Draft, script: FootieScript): Draft;
//# sourceMappingURL=draft-model.utils.d.ts.map