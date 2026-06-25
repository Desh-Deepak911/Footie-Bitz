import type { FootieScript } from "@/features/story/types";
/** Normalized voiceover source resolved from canonical and legacy story fields. */
export interface CanonicalVoiceover {
    url: string;
    durationMs?: number;
}
/**
 * Resolves the playable voiceover URL and duration from canonical and legacy story fields.
 * Priority: `voiceoverUrl` → `voiceover` → `audioUrl` → `voiceoverAudio`.
 */
export declare function getCanonicalVoiceover(story: FootieScript | null | undefined): CanonicalVoiceover | null;
//# sourceMappingURL=canonical-voiceover.utils.d.ts.map