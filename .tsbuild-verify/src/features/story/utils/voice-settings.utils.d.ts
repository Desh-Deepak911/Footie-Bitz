import type { FootieScript, StoryVoiceSettings } from "@/features/story/types";
type VoiceSettingsInput = Pick<FootieScript, "voiceSettings"> & {
    /** @deprecated Migrated into `voiceSettings.speed`. */
    voiceoverSpeed?: number;
};
/** Normalizes story voice settings with defaults and supported speed presets. */
export declare function normalizeStoryVoiceSettings(input: VoiceSettingsInput): StoryVoiceSettings;
/** Returns normalized voice settings, always with `speed` initialized. */
export declare function getStoryVoiceSettings(script: FootieScript | null | undefined): StoryVoiceSettings;
export {};
//# sourceMappingURL=voice-settings.utils.d.ts.map