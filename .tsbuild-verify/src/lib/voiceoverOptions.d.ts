export declare const VOICEOVER_VOICE_OPTIONS: readonly ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
export type VoiceoverVoiceOption = (typeof VOICEOVER_VOICE_OPTIONS)[number];
export declare const DEFAULT_VOICEOVER_VOICE: VoiceoverVoiceOption;
export declare function resolveVoiceoverVoice(voice: unknown): string;
/** Supported TTS speed presets for story voice settings. */
export declare const VOICEOVER_SPEED_OPTIONS: readonly [0.75, 0.9, 1, 1.1, 1.25, 1.4];
export type VoiceoverSpeedOption = (typeof VOICEOVER_SPEED_OPTIONS)[number];
export declare const VOICE_SPEED_LABELS: Record<VoiceoverSpeedOption, string>;
export declare const DEFAULT_VOICEOVER_SPEED: VoiceoverSpeedOption;
export declare function resolveVoiceoverSpeed(speed: unknown): VoiceoverSpeedOption;
//# sourceMappingURL=voiceoverOptions.d.ts.map