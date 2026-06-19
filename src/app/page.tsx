"use client";

import {
  ChevronDown,
  Clapperboard,
  FileText,
  Info,
  Loader2,
  PenLine,
  Sparkles,
} from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";

import BreakLongVideoSection from "@/components/BreakLongVideoSection";
import ExportPanel from "@/components/ExportPanel";
import NarrationPanel from "@/components/NarrationPanel";
import SceneEditor from "@/components/SceneEditor";
import StoryReview from "@/components/StoryReview";
import VideoPreview from "@/components/VideoPreview";
import { applyStoryUpdate } from "@/lib/voiceover";
import {
  studioBadge,
  studioCard,
  studioInput,
  studioPrimaryButton,
  studioSectionDesc,
  studioSectionTitle,
  studioStepLabel,
} from "@/lib/studioUi";
import type {
  FootieScript,
  GenerateScriptResponse,
  QualityMode,
  Tone,
} from "@/types/footiebitz";

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "dramatic", label: "Dramatic", description: "High stakes, cinematic" },
  { value: "funny", label: "Funny", description: "Witty and banter-led" },
  { value: "tactical", label: "Tactical", description: "Insight and analysis" },
  { value: "news", label: "News", description: "Headline-style recap" },
  { value: "emotional", label: "Emotional", description: "Passion and feeling" },
];

const DURATION_OPTIONS = [30, 45, 60] as const;

const QUALITY_OPTIONS: { value: QualityMode; label: string; description: string }[] = [
  { value: "cheap", label: "Cheap Draft", description: "Fastest, lowest token cost" },
  { value: "balanced", label: "Balanced", description: "Good quality and cost" },
  { value: "best", label: "Best", description: "Highest quality stories" },
];

const SAMPLE_TOPICS = [
  "Top 5 matches to watch: USA vs Iran, Portugal vs Argentina, Morocco vs Senegal, England vs Spain, France vs Norway",
  "Real Madrid comeback",
  "Messi masterclass",
  "Champions League final drama",
  "Last-minute winner",
  "Derby day chaos",
] as const;

const WORKFLOW_STEPS = [
  { step: "01", title: "Story Brief", desc: "Describe your topic, duration, and tone" },
  { step: "02", title: "Story Draft", desc: "Refine the title and full narration" },
  { step: "03", title: "Production Timeline", desc: "Set scene timing, subtitles, and images" },
  { step: "04", title: "Narration", desc: "Generate spoken audio from your story" },
  { step: "05", title: "Preview", desc: "Review your vertical short before export" },
  { step: "06", title: "Export", desc: "Download a finished WebM short" },
] as const;

const STUDIO_STEPS = [
  "Story Brief",
  "Story Draft",
  "Production Timeline",
  "Narration",
  "Preview",
  "Export",
] as const;

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`${studioCard} ${className}`}>{children}</section>;
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("dramatic");
  const [duration, setDuration] = useState<number>(30);
  const [qualityMode, setQualityMode] = useState<QualityMode>("cheap");
  const [script, setScript] = useState<FootieScript | null>(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDuration = script?.totalDuration ?? 0;

  const previewSceneIndex =
    script && script.scenes.length > 0
      ? Math.min(selectedSceneIndex, script.scenes.length - 1)
      : 0;

  const handleStoryChange = useCallback((next: FootieScript) => {
    setScript((prev) => (prev ? applyStoryUpdate(prev, next) : next));
  }, []);

  const generateScript = async () => {
    if (!topic.trim()) {
      setError("Enter a content brief first.");
      return;
    }

    setLoading(true);
    setError(null);
    setScript(null);
    setSelectedSceneIndex(0);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), tone, duration, qualityMode }),
      });

      let data: GenerateScriptResponse;
      try {
        data = (await response.json()) as GenerateScriptResponse;
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error ?? "Failed to create story");
      }

      setScript(data.data);
      setSelectedSceneIndex(0);
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Network error. Check your connection and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-30%,rgba(120,113,108,0.08),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-[0_0_20px_rgba(255,255,255,0.04)]">
                <PenLine className="h-4.5 w-4.5 text-zinc-300" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-zinc-50">FootieBitz</p>
                <p className="text-xs text-zinc-500">Turn football ideas into narrated shorts.</p>
              </div>
            </div>

            {script ? (
              <div className="flex max-w-[min(100%,240px)] items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 sm:max-w-none">
                <Clapperboard className="hidden h-4 w-4 shrink-0 text-zinc-500 sm:block" />
                <div className="min-w-0 text-right sm:text-left">
                  <p className="truncate text-sm font-medium text-zinc-200">{script.title}</p>
                  <p className="text-xs text-zinc-500">
                    {totalDuration}s · {script.scenes.length} scenes
                  </p>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                {["9:16", "Narrated", "WebM"].map((tag) => (
                  <span key={tag} className={studioBadge}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          {!script && !loading && (
            <section className="mb-10">
              <h1 className="max-w-xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                Story studio for football shorts
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500 sm:text-base">
                Draft a narration, build a timed timeline, preview vertically, and export — one
                calm workflow from idea to short.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {STUDIO_STEPS.map((label, index) => (
                  <span
                    key={label}
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                      index === 0
                        ? "border-zinc-600 bg-zinc-800/60 text-zinc-200"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-600"
                    }`}
                  >
                    {index + 1}. {label}
                  </span>
                ))}
              </div>
            </section>
          )}

          <div className="space-y-8">
            <Card>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-900/50 bg-sky-950/30">
                  <FileText className="h-4.5 w-4.5 text-sky-400/80" strokeWidth={1.75} />
                </div>
                <div>
                  <p className={studioStepLabel}>Step 1</p>
                  <h2 className={studioSectionTitle}>Story Brief</h2>
                  <p className={studioSectionDesc}>
                    Describe your topic, choose duration and tone, then create your story.
                  </p>
                </div>
              </div>

              <form
                className="mt-8 space-y-7"
                onSubmit={(e) => {
                  e.preventDefault();
                  generateScript();
                }}
              >
                <div>
                  <label htmlFor="topic" className="mb-2 block text-sm font-medium text-zinc-300">
                    Content brief
                  </label>
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder='e.g. "Arsenal 3-1 Chelsea" or "Haaland hat-trick vs Wolves"'
                    disabled={loading}
                    className={studioInput}
                  />
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-zinc-600">Quick samples</p>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_TOPICS.map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            setTopic(sample);
                            setError(null);
                          }}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            topic === sample
                              ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                              : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                          }`}
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label htmlFor="tone" className="mb-2 block text-sm font-medium text-zinc-300">
                      Tone / style
                    </label>
                    <div className="relative">
                      <select
                        id="tone"
                        value={tone}
                        onChange={(e) => setTone(e.target.value as Tone)}
                        disabled={loading}
                        className={`${studioInput} appearance-none pr-10`}
                      >
                        {TONE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} — {option.description}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="duration" className="mb-2 block text-sm font-medium text-zinc-300">
                      Duration
                    </label>
                    <div className="relative">
                      <select
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        disabled={loading}
                        className={`${studioInput} appearance-none pr-10`}
                      >
                        {DURATION_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option} seconds
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="qualityMode"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Story quality
                    </label>
                    <div className="relative">
                      <select
                        id="qualityMode"
                        value={qualityMode}
                        onChange={(e) => setQualityMode(e.target.value as QualityMode)}
                        disabled={loading}
                        className={`${studioInput} appearance-none pr-10`}
                      >
                        {QUALITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} — {option.description}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
                  <p className="text-xs leading-relaxed text-zinc-500">
                    <span className="font-medium text-zinc-400">Token usage:</span> only story
                    creation uses tokens. Uploading images, editing subtitles, previewing, and
                    exporting video are handled in your browser.
                  </p>
                </div>

                <button type="submit" disabled={loading} className={`${studioPrimaryButton} w-full sm:w-auto`}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating story...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                      Create Story
                    </>
                  )}
                </button>

                {error && (
                  <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
              </form>
            </Card>

            {!script && !loading && (
              <Card>
                <p className={studioStepLabel}>Workflow</p>
                <h2 className={`${studioSectionTitle} mt-2`}>How it works</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {WORKFLOW_STEPS.map((item) => (
                    <div
                      key={item.step}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4"
                    >
                      <span className="text-xs font-medium text-zinc-600">{item.step}</span>
                      <p className="mt-2 text-sm font-medium text-zinc-200">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {loading && (
              <Card className="border-zinc-700/50">
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-zinc-800/50" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
                      <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100">Creating your story...</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                    Crafting a {duration}s {tone} story for &ldquo;{topic.trim()}&rdquo;
                  </p>
                  <div className="mt-8 grid w-full max-w-md gap-2">
                    {["Analysing topic", "Building scenes", "Writing narration"].map((step) => (
                      <div
                        key={step}
                        className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-400"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {script && !loading && (
              <>
                <Card>
                  <StoryReview story={script} onStoryChange={handleStoryChange} />
                </Card>

                <Card>
                  <SceneEditor
                    script={script}
                    onScriptChange={handleStoryChange}
                    selectedSceneIndex={selectedSceneIndex}
                  />
                </Card>

                <Card>
                  <NarrationPanel script={script} onScriptChange={handleStoryChange} />
                </Card>

                <Card>
                  <div className="mb-8">
                    <p className={studioStepLabel}>Step 5</p>
                    <h2 className={studioSectionTitle}>Preview</h2>
                    <p className={studioSectionDesc}>
                      Play back your vertical short with narration or browser voice.
                    </p>
                  </div>
                  <VideoPreview
                    script={script}
                    selectedSceneIndex={previewSceneIndex}
                    onSelectedSceneChange={setSelectedSceneIndex}
                  />
                </Card>

                <Card>
                  <ExportPanel script={script} />
                </Card>
              </>
            )}

            {!script && !loading && <BreakLongVideoSection />}
          </div>
        </main>

        <footer className="mt-auto border-t border-zinc-800/80 py-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
            <p className="text-sm font-medium text-zinc-500">FootieBitz</p>
            <p className="text-xs text-zinc-600">Turn football ideas into narrated shorts.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
