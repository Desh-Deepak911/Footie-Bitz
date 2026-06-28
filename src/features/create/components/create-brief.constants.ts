import type { RefObject } from "react";

import type { QualityMode, ScriptMode, Tone } from "@/types/footiebitz";

export const CREATE_BRIEF_FORM_ID = "create-brief-form";

export const BRIEF_TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "dramatic", label: "Dramatic", description: "High stakes, cinematic" },
  { value: "funny", label: "Funny", description: "Witty and banter-led" },
  { value: "tactical", label: "Tactical", description: "Insight and analysis" },
  { value: "news", label: "News", description: "Headline-style recap" },
  { value: "emotional", label: "Emotional", description: "Passion and feeling" },
];

export const BRIEF_DURATION_OPTIONS = [30, 45, 60] as const;

export const BRIEF_QUALITY_OPTIONS: { value: QualityMode; label: string; description: string }[] = [
  { value: "cheap", label: "Fast", description: "Quickest first pass" },
  { value: "balanced", label: "Balanced", description: "Good balance of speed and polish" },
  { value: "best", label: "Studio", description: "Highest polish" },
];

export interface BriefCanvasProps {
  topic: string;
  onTopicChange: (value: string) => void;
  topicInputRef: RefObject<HTMLTextAreaElement | null>;
  scriptMode: ScriptMode;
  onScriptModeChange: (mode: ScriptMode) => void;
  context: string;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  sampleTopics: readonly string[];
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onSubmit: () => void;
}
