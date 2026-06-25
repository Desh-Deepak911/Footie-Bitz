import type { FootieScript } from "@/features/story/types";
/** True when the story has a playable narration blob or URL. */
export declare function hasVoiceoverAudio(script: FootieScript | null | undefined): boolean;
/** True when voiceover audio and measured scene timing are both present. */
export declare function isAudioFirstStory(script: FootieScript | null | undefined): boolean;
/**
 * Applies safe defaults for legacy stories — does not migrate or invent voiceover data.
 * Optional audio-first fields are preserved when already present.
 */
export declare function coerceLegacyStoryFields(script: FootieScript): FootieScript;
/** Resolves playback/export duration without requiring voiceover metadata. */
export declare function resolveStoryDurationSec(script: FootieScript | null | undefined): number;
//# sourceMappingURL=legacy-story.utils.d.ts.map