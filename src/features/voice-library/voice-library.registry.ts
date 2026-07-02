import type { VoiceCategory, VoiceLibraryEntry } from "./voice-library.types";

/** OpenAI voices accepted by `resolveVoiceoverVoice` — UI catalog source of truth. */
export const OPENAI_VOICE_LIBRARY_IDS = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "marin",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "cedar",
] as const;

export type OpenAiVoiceLibraryId = (typeof OPENAI_VOICE_LIBRARY_IDS)[number];

export const VOICE_CATEGORY_LABELS: Record<VoiceCategory, string> = {
  documentary: "Documentary",
  sports: "Sports",
  cinematic: "Cinematic",
  news: "News",
  calm: "Calm",
  energetic: "Energetic",
  storytelling: "Storytelling",
};

export const VOICE_LIBRARY_CATEGORY_ORDER: VoiceCategory[] = [
  "sports",
  "documentary",
  "cinematic",
  "news",
  "storytelling",
  "energetic",
  "calm",
];

const VOICE_LIBRARY_ENTRIES: VoiceLibraryEntry[] = [
  {
    id: "alloy",
    displayName: "Alloy",
    description: "Balanced and clear — a reliable default for mixed football stories.",
    category: "documentary",
    toneTags: ["neutral", "clear"],
    useCaseTags: ["explainers", "recaps"],
    genderHint: "neutral",
    provider: "openai",
    available: true,
  },
  {
    id: "ash",
    displayName: "Ash",
    description: "Warm conversational tone suited to fan-facing commentary.",
    category: "storytelling",
    toneTags: ["warm", "conversational"],
    useCaseTags: ["fan stories", "behind the scenes"],
    genderHint: "neutral",
    provider: "openai",
    available: true,
  },
  {
    id: "ballad",
    displayName: "Ballad",
    description: "Soft and expressive — ideal for emotional player arcs.",
    category: "cinematic",
    toneTags: ["soft", "expressive"],
    useCaseTags: ["tributes", "legacy pieces"],
    genderHint: "neutral",
    provider: "openai",
    available: true,
  },
  {
    id: "coral",
    displayName: "Coral",
    description: "Bright and approachable for quick match highlights.",
    category: "energetic",
    toneTags: ["bright", "friendly"],
    useCaseTags: ["highlights", "social clips"],
    genderHint: "feminine",
    provider: "openai",
    available: true,
  },
  {
    id: "echo",
    displayName: "Echo",
    description: "Steady male delivery with authority for tactical breakdowns.",
    category: "documentary",
    toneTags: ["steady", "authoritative"],
    useCaseTags: ["tactics", "analysis"],
    genderHint: "masculine",
    provider: "openai",
    available: true,
  },
  {
    id: "fable",
    displayName: "Fable",
    description: "Expressive British-leaning storyteller for narrative shorts.",
    category: "storytelling",
    toneTags: ["expressive", "narrative"],
    useCaseTags: ["story modes", "history"],
    genderHint: "neutral",
    accentHint: "British-leaning",
    provider: "openai",
    available: true,
  },
  {
    id: "marin",
    displayName: "Marin",
    description: "Crisp broadcast tone for fast-paced sports updates.",
    category: "news",
    toneTags: ["crisp", "broadcast"],
    useCaseTags: ["headlines", "transfer news"],
    genderHint: "neutral",
    provider: "openai",
    available: true,
  },
  {
    id: "nova",
    displayName: "Nova",
    description: "Youthful energy for hype reels and celebration moments.",
    category: "sports",
    toneTags: ["youthful", "upbeat"],
    useCaseTags: ["goals", "celebrations"],
    genderHint: "feminine",
    provider: "openai",
    available: true,
  },
  {
    id: "onyx",
    displayName: "Onyx",
    description: "Deep and commanding — strong presence for big-match intros.",
    category: "cinematic",
    toneTags: ["deep", "commanding"],
    useCaseTags: ["intros", "derbies"],
    genderHint: "masculine",
    provider: "openai",
    available: true,
  },
  {
    id: "sage",
    displayName: "Sage",
    description: "Calm expert voice for measured analysis and retrospectives.",
    category: "calm",
    toneTags: ["calm", "measured"],
    useCaseTags: ["analysis", "retrospectives"],
    genderHint: "neutral",
    provider: "openai",
    available: true,
  },
  {
    id: "shimmer",
    displayName: "Shimmer",
    description: "Light and polished for upbeat studio-style narration.",
    category: "energetic",
    toneTags: ["light", "polished"],
    useCaseTags: ["studio", "listicles"],
    genderHint: "feminine",
    provider: "openai",
    available: true,
  },
  {
    id: "verse",
    displayName: "Verse",
    description: "Versatile neutral tone that adapts across story formats.",
    category: "storytelling",
    toneTags: ["versatile", "neutral"],
    useCaseTags: ["general", "multi-scene"],
    genderHint: "neutral",
    provider: "openai",
    available: true,
  },
  {
    id: "cedar",
    displayName: "Cedar",
    description: "Grounded sports narrator with natural pacing for longer scripts.",
    category: "sports",
    toneTags: ["grounded", "natural"],
    useCaseTags: ["match recaps", "season reviews"],
    genderHint: "masculine",
    provider: "openai",
    available: true,
  },
];

const VOICE_LIBRARY_BY_ID = new Map<string, VoiceLibraryEntry>(
  VOICE_LIBRARY_ENTRIES.map((entry) => [entry.id, entry]),
);

/** Returns all catalog voices in stable registry order. */
export function getVoiceLibraryEntries(): VoiceLibraryEntry[] {
  return VOICE_LIBRARY_ENTRIES.map((entry) => ({ ...entry }));
}

/** Returns a catalog entry when the voice id is known. */
export function getVoiceLibraryEntry(voiceId: string): VoiceLibraryEntry | undefined {
  return VOICE_LIBRARY_BY_ID.get(voiceId.trim().toLowerCase());
}
