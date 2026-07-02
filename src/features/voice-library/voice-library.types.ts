/** Primary catalog grouping for voice palette navigation. */
export type VoiceCategory =
  | "documentary"
  | "sports"
  | "cinematic"
  | "news"
  | "calm"
  | "energetic"
  | "storytelling";

export type VoiceLibraryProvider = "openai";

/** Catalog entry for a selectable TTS voice — UI metadata only. */
export interface VoiceLibraryEntry {
  id: string;
  displayName: string;
  description: string;
  category: VoiceCategory;
  toneTags: string[];
  useCaseTags: string[];
  genderHint?: string;
  accentHint?: string;
  provider: VoiceLibraryProvider;
  available: true;
}

export interface VoiceLibraryCategoryGroup {
  category: VoiceCategory;
  label: string;
  voices: VoiceLibraryEntry[];
}

export type VoiceLibraryFilter = "all" | VoiceCategory;

export interface VoiceLibraryPanelProps {
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
  disabled?: boolean;
  /** Denser layout for Project Audio Studio. */
  compact?: boolean;
  /** Associates the panel with an external label element. */
  labelledBy?: string;
  /** Current story speed preset used for preview playback. */
  previewSpeed?: number;
  /** Current delivery style preset for preview playback. */
  previewStylePreset?: string;
  /** Whether expressive delivery is enabled for preview playback. */
  previewExpressiveDelivery?: boolean;
}

export interface VoiceCardProps {
  voice: VoiceLibraryEntry;
  selected: boolean;
  disabled?: boolean;
  compact?: boolean;
  previewSpeed?: number;
  previewStylePreset?: string;
  previewExpressiveDelivery?: boolean;
  onSelect: (voiceId: string) => void;
}
