"use client";

import { ChevronDown, Info, Sparkles } from "lucide-react";
import type { RefObject } from "react";

import {
  studioChip,
  studioChipActive,
  studioComposerButton,
  studioComposerCard,
  studioComposerHelper,
  studioComposerInput,
  studioComposerSelect,
  studioError,
  studioFieldLabel,
  studioInfoCallout,
  studioSectionDesc,
  studioSectionTitle,
  studioSelectChevronCompact,
  studioStepLabel,
} from "@/lib/studioUi";
import ResearchPreviewPanel from "@/features/create/components/ResearchPreviewPanel";
import type { ResearchPreviewState } from "@/features/create/types/research-preview.types";
import type { QualityMode, ScriptMode, Tone } from "@/types/footiebitz";
import { MAX_SCENE_COUNT, MIN_SCENE_COUNT, SCRIPT_MODE_OPTIONS } from "@/types/footiebitz";

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "dramatic", label: "Dramatic", description: "High stakes, cinematic" },
  { value: "funny", label: "Funny", description: "Witty and banter-led" },
  { value: "tactical", label: "Tactical", description: "Insight and analysis" },
  { value: "news", label: "News", description: "Headline-style recap" },
  { value: "emotional", label: "Emotional", description: "Passion and feeling" },
];

const DURATION_OPTIONS = [30, 45, 60] as const;

const QUALITY_OPTIONS: { value: QualityMode; label: string; description: string }[] = [
  { value: "cheap", label: "Fast", description: "Quickest first pass" },
  { value: "balanced", label: "Balanced", description: "Good balance of speed and polish" },
  { value: "best", label: "Studio", description: "Highest polish" },
];

interface StoryComposerProps {
  topic: string;
  onTopicChange: (value: string) => void;
  topicInputRef: RefObject<HTMLTextAreaElement | null>;
  scriptMode: ScriptMode;
  onScriptModeChange: (mode: ScriptMode) => void;
  context: string;
  onContextChange: (value: string) => void;
  enableResearch: boolean;
  onEnableResearchChange: (enabled: boolean) => void;
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  qualityMode: QualityMode;
  onQualityModeChange: (mode: QualityMode) => void;
  sceneCount: number;
  onSceneCountChange: (count: number) => void;
  sampleTopics: readonly string[];
  loading: boolean;
  error: string | null;
  onClearError: () => void;
  onSubmit: () => void;
  researchPreview: ResearchPreviewState;
  onPreviewResearch: () => void;
}

export default function StoryComposer({
  topic,
  onTopicChange,
  topicInputRef,
  scriptMode,
  onScriptModeChange,
  context,
  onContextChange,
  enableResearch,
  onEnableResearchChange,
  tone,
  onToneChange,
  duration,
  onDurationChange,
  qualityMode,
  onQualityModeChange,
  sceneCount,
  onSceneCountChange,
  sampleTopics,
  loading,
  error,
  onClearError,
  onSubmit,
  researchPreview,
  onPreviewResearch,
}: StoryComposerProps) {
  return (
    <section id="studio-brief" className="min-w-0 w-full">
      <div className="mb-4 sm:mb-6">
        <p className={studioStepLabel}>Create</p>
        <h2 className={studioSectionTitle}>Your brief</h2>
        <p className={studioSectionDesc}>
          Turn your idea into a short-form story.
        </p>
      </div>

      <form
        className="w-full space-y-4 sm:space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className={studioComposerCard}>
          <div>
            <label htmlFor="scriptMode" className={`${studioFieldLabel} px-2 sm:px-0`}>
              Story type
            </label>
            <div className="relative">
              <select
                id="scriptMode"
                value={scriptMode}
                onChange={(e) => onScriptModeChange(e.target.value as ScriptMode)}
                disabled={loading}
                className={studioComposerSelect}
              >
                {SCRIPT_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className={studioSelectChevronCompact} />
            </div>
            <p className={`${studioComposerHelper} mt-1.5 px-2 sm:px-0`}>
              {SCRIPT_MODE_OPTIONS.find((option) => option.value === scriptMode)?.description}
            </p>
          </div>

          <label htmlFor="topic" className="sr-only">
            Story topic
          </label>
          <textarea
            id="topic"
            ref={topicInputRef}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder={
              enableResearch
                ? "Short headline or prompt — e.g. Arsenal vs Chelsea, or Erling Haaland form"
                : "Describe the story you want to create..."
            }
            disabled={loading}
            rows={4}
            className={`${studioComposerInput} mt-4`}
          />

          <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-elevated/40 px-3 py-3 ring-1 ring-border/25 sm:px-4">
            <input
              id="enableResearch"
              type="checkbox"
              checked={enableResearch}
              onChange={(e) => onEnableResearchChange(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            />
            <div>
              <label htmlFor="enableResearch" className="text-sm font-medium text-foreground/90">
                Smart Research
              </label>
              <p className={`${studioComposerHelper} mt-1`}>
                We&apos;ll gather supporting information automatically.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="context" className={`${studioFieldLabel} px-2 sm:px-0`}>
              Additional Notes
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => onContextChange(e.target.value)}
              placeholder="Stats, formations, or anything else to include"
              disabled={loading}
              rows={3}
              className={`${studioComposerInput} mt-1.5`}
            />
            <p className={`${studioComposerHelper} mt-1`}>
              Add any extra details you&apos;d like included.
            </p>
          </div>

          <ResearchPreviewPanel
            enableResearch={enableResearch}
            topic={topic}
            scriptMode={scriptMode}
            preview={researchPreview}
            disabled={loading}
            onPreviewResearch={onPreviewResearch}
          />

          <p className={`${studioComposerHelper} mt-3`}>
            Write your story first — narration and storyboard come on the next screens.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-border/50 pt-3.5 sm:mt-4 sm:grid-cols-2 sm:gap-4 sm:pt-4 lg:grid-cols-4">
            <div>
              <label htmlFor="tone" className={`${studioFieldLabel} px-2 sm:px-0`}>
                Tone
              </label>
              <div className="relative">
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => onToneChange(e.target.value as Tone)}
                  disabled={loading}
                  className={studioComposerSelect}
                >
                  {TONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className={studioSelectChevronCompact} />
              </div>
            </div>

            <div>
              <label htmlFor="duration" className={`${studioFieldLabel} px-2 sm:px-0`}>
                Duration
              </label>
              <div className="relative">
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => onDurationChange(Number(e.target.value))}
                  disabled={loading}
                  className={studioComposerSelect}
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}s
                    </option>
                  ))}
                </select>
                <ChevronDown className={studioSelectChevronCompact} />
              </div>
            </div>

            <div>
              <label htmlFor="qualityMode" className={`${studioFieldLabel} px-2 sm:px-0`}>
                Quality
              </label>
              <div className="relative">
                <select
                  id="qualityMode"
                  value={qualityMode}
                  onChange={(e) => onQualityModeChange(e.target.value as QualityMode)}
                  disabled={loading}
                  className={studioComposerSelect}
                >
                  {QUALITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className={studioSelectChevronCompact} />
              </div>
            </div>

            <div>
              <label htmlFor="sceneCount" className={`${studioFieldLabel} px-2 sm:px-0`}>
                Number of scenes
              </label>
              <input
                id="sceneCount"
                type="number"
                min={MIN_SCENE_COUNT}
                max={MAX_SCENE_COUNT}
                step={1}
                value={sceneCount}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (!Number.isFinite(next)) {
                    return;
                  }
                  onSceneCountChange(
                    Math.max(MIN_SCENE_COUNT, Math.min(MAX_SCENE_COUNT, Math.round(next))),
                  );
                }}
                disabled={loading}
                className={studioComposerSelect}
              />
            </div>
          </div>
        </div>

        <div>
          <p className={`${studioFieldLabel} mb-2.5`}>
            Try an example
          </p>
          <div className="flex min-w-0 flex-wrap gap-2">
            {sampleTopics.map((sample) => (
              <button
                key={sample}
                type="button"
                disabled={loading}
                onClick={() => {
                  onTopicChange(sample);
                  onClearError();
                }}
                className={topic === sample ? studioChipActive : studioChip}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <div className={studioInfoCallout}>
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
          <p className="text-xs leading-relaxed text-muted">
            Story writing happens online. Images, edits, preview, and download stay on your device.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" disabled={loading} className={studioComposerButton}>
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            {loading ? "Writing story..." : "Write Story"}
          </button>
        </div>

        {error ? <div className={studioError}>{error}</div> : null}
      </form>
    </section>
  );
}
