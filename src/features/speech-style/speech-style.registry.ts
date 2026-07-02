import type { SpeechStylePreset, SpeechStylePresetConfig } from "./speech-style.types";

export const SPEECH_STYLE_PRESET_ORDER: SpeechStylePreset[] = [
  "neutral",
  "documentary",
  "sports_hype",
  "cinematic",
  "news",
  "calm_storytelling",
  "debate",
  "countdown",
];

const SPEECH_STYLE_PRESETS: SpeechStylePresetConfig[] = [
  {
    id: "neutral",
    label: "Neutral",
    description: "Standard narration — same delivery as before expressive styles.",
    toneTags: ["balanced", "default"],
    recommendedFor: ["general", "legacy drafts"],
    instructionText: "",
  },
  {
    id: "documentary",
    label: "Documentary",
    description: "Measured, authoritative delivery with clear enunciation.",
    toneTags: ["measured", "authoritative"],
    recommendedFor: ["explainers", "analysis", "history"],
    instructionText:
      "Deliver in a measured documentary tone. Use clear enunciation, steady pacing, and calm authority. Add brief pauses before key phrases for emphasis. Do not add, remove, or change any facts or words — guide pacing, emotion, and emphasis only.",
  },
  {
    id: "sports_hype",
    label: "Sports Hype",
    description: "High-energy, punchy cadence for highlights and big moments.",
    toneTags: ["energetic", "punchy"],
    recommendedFor: ["goals", "highlights", "celebrations"],
    instructionText:
      "Deliver with sports hype energy — punchy cadence, rising excitement on key moments, and crisp emphasis. Keep momentum high without rushing clarity. Do not add, remove, or change any facts or words — guide pacing, emotion, and emphasis only.",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Dramatic pacing with deliberate pauses and gravitas.",
    toneTags: ["dramatic", "gravitas"],
    recommendedFor: ["intros", "tributes", "derbies"],
    instructionText:
      "Deliver in a cinematic narrator voice — deliberate pacing, dramatic pauses, and emotional weight on pivotal beats. Build tension through rhythm, not rewritten text. Do not add, remove, or change any facts or words — guide pacing, emotion, and emphasis only.",
  },
  {
    id: "news",
    label: "News",
    description: "Crisp, neutral broadcast delivery for updates and headlines.",
    toneTags: ["crisp", "broadcast"],
    recommendedFor: ["headlines", "transfers", "recaps"],
    instructionText:
      "Deliver like a news anchor — crisp, neutral, and efficient with clean phrase breaks. Keep a steady broadcast rhythm. Do not add, remove, or change any facts or words — guide pacing, emotion, and emphasis only.",
  },
  {
    id: "calm_storytelling",
    label: "Calm Storytelling",
    description: "Warm, unhurried delivery for reflective stories.",
    toneTags: ["warm", "unhurried"],
    recommendedFor: ["player stories", "behind the scenes"],
    instructionText:
      "Deliver in a calm storytelling voice — warm, unhurried, and gently expressive. Use soft emphasis and natural pauses between ideas. Do not add, remove, or change any facts or words — guide pacing, emotion, and emphasis only.",
  },
  {
    id: "debate",
    label: "Debate",
    description: "Assertive, contrasting beats with rhetorical stress.",
    toneTags: ["assertive", "rhetorical"],
    recommendedFor: ["opinion", "hot takes", "arguments"],
    instructionText:
      "Deliver with debate-style conviction — assertive stress on contrasting points, rhetorical beats, and conversational friction. Vary emphasis to highlight tension between ideas. Do not add, remove, or change any facts or words — guide pacing, emotion, and emphasis only.",
  },
  {
    id: "countdown",
    label: "Countdown",
    description: "Tight rhythm with building tension and clipped urgency.",
    toneTags: ["urgent", "building"],
    recommendedFor: ["pre-match", "top lists", "deadline moments"],
    instructionText:
      "Deliver with countdown urgency — tight rhythm, building tension, and clipped phrases that accelerate toward the climax. Use pauses sparingly for impact. Do not add, remove, or change any facts or words — guide pacing, emotion, and emphasis only.",
  },
];

const PRESET_BY_ID = new Map<string, SpeechStylePresetConfig>(
  SPEECH_STYLE_PRESETS.map((preset) => [preset.id, preset]),
);

/** Returns all speech style presets in stable registry order. */
export function getSpeechStylePresets(): SpeechStylePresetConfig[] {
  return SPEECH_STYLE_PRESETS.map((preset) => ({ ...preset }));
}

/** Returns a preset config when the id is known. */
export function getSpeechStylePreset(presetId: string): SpeechStylePresetConfig | undefined {
  return PRESET_BY_ID.get(presetId.trim().toLowerCase());
}
