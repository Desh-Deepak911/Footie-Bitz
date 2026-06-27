"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import StoryReview from "@/components/StoryReview";
import StudioLoadingState from "@/components/StudioLoadingState";
import VoiceSettingsCard from "@/components/VoiceSettingsCard";
import { AppShell } from "@/components/layout";
import { Card } from "@/components/ui";
import { getCanonicalVoiceover } from "@/features/audio";
import DraftLoadingState from "@/features/drafts/components/DraftLoadingState";
import { isEditorReadyDraft } from "@/features/drafts";
import { useReviewStoryDocument } from "@/features/drafts/hooks/useReviewStoryDocument";
import { useDraftPersistFeedback } from "@/features/drafts/hooks/useDraftPersistFeedback";
import type { Draft, DraftPersistedScript } from "@/features/drafts";
import type { FootieScript } from "@/features/story/types";
import { consumeGenerateScriptStream } from "@/lib/generateScriptStream";
import {
  studioBadge,
  studioFieldLabel,
  studioInput,
  studioPanel,
  studioPrimaryButton,
  studioSecondaryButton,
  studioSectionDesc,
  studioSectionTitle,
  studioStepLabel,
  studioSubtleText,
} from "@/lib/studioUi";
import { applyStoryUpdate, syncFootieScript } from "@/lib/voiceover";
import type { GenerateScriptResponse, GenerationLoadingStep } from "@/types/footiebitz";
import {
  DEFAULT_SCENE_COUNT,
  MAX_SCENE_COUNT,
  MIN_SCENE_COUNT,
  resolveScriptMode,
  SCRIPT_MODE_OPTIONS,
} from "@/types/footiebitz";

interface ScriptReviewFlowProps {
  draftId: string;
}

type ReviewStep = 2 | 3 | 4 | 5;

const REVIEW_STEPS: Array<{ step: ReviewStep; title: string; desc: string }> = [
  { step: 2, title: "Story", desc: "Edit title and narration — changes save automatically" },
  { step: 3, title: "Narration", desc: "Create narration audio from your edited story" },
  { step: 4, title: "Storyboard", desc: "Build timed scenes from your narration" },
  { step: 5, title: "Editor", desc: "Add images, preview, and export" },
];

function logCreateScenes(message: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (details) {
    console.log(`[Create Scenes] ${message}`, details);
  } else {
    console.log(`[Create Scenes] ${message}`);
  }
}

function resolveReviewHasVoiceover(
  script: FootieScript,
  options?: {
    pipelineStage?: Draft["pipelineStage"];
    draftHasVoiceover?: boolean;
  },
): boolean {
  if (getCanonicalVoiceover(script)?.url) {
    return true;
  }

  if ((script as DraftPersistedScript).voiceoverAudioBase64) {
    return true;
  }

  if (
    options?.pipelineStage === "voiceover_ready" &&
    script.voiceoverDurationMs != null &&
    script.voiceoverDurationMs > 0
  ) {
    return true;
  }

  return Boolean(options?.draftHasVoiceover);
}

function resolveActiveReviewStep(
  script: FootieScript,
  pipelineStage?: Draft["pipelineStage"],
  draftHasVoiceover?: boolean,
): ReviewStep {
  if (script.scenes.length > 0 || pipelineStage === "editor_ready") {
    return 5;
  }

  if (resolveReviewHasVoiceover(script, { pipelineStage, draftHasVoiceover })) {
    return 4;
  }

  return 2;
}

function mergeStoryboardOntoScript(current: FootieScript, generated: FootieScript): FootieScript {
  return syncFootieScript({
    ...current,
    title: generated.title,
    narration: generated.narration,
    totalDuration: generated.totalDuration,
    scenes: generated.scenes,
    timelineItems: generated.timelineItems,
  });
}

function ScriptReviewFlowContent({ draftId }: ScriptReviewFlowProps) {
  const router = useRouter();
  const saveMessageTimeoutRef = useRef<number | null>(null);
  const scriptAutosaveReadyRef = useRef(false);
  const persistedVoiceoverUrlRef = useRef<string | undefined>(undefined);
  const isCreatingScenesRef = useRef(false);
  const {
    isLoading,
    isNotFound,
    draft: loadedDraft,
    script,
    updateScript,
    applyEditorReadyScript,
    setCreationBrief,
    schedulePersist,
    flushPersist,
  } = useReviewStoryDocument(draftId);
  const scriptRef = useRef(script);
  const loadedDraftRef = useRef(loadedDraft);

  useLayoutEffect(() => {
    scriptRef.current = script;
    loadedDraftRef.current = loadedDraft;
  }, [loadedDraft, script]);

  const { persistWarning, autosaveSavedMessage } = useDraftPersistFeedback(draftId);
  const [sceneCountOverride, setSceneCountOverride] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isCreatingScenes, setIsCreatingScenes] = useState(false);
  const [createScenesError, setCreateScenesError] = useState<string | null>(null);
  const [scenesCreatedSuccessfully, setScenesCreatedSuccessfully] = useState(false);
  const [storyboardStep, setStoryboardStep] = useState<GenerationLoadingStep>(3);

  const creationBrief = loadedDraft?.creationBrief;
  const sceneCount =
    sceneCountOverride ?? loadedDraft?.creationBrief?.sceneCount ?? DEFAULT_SCENE_COUNT;
  const pipelineStage = loadedDraft?.pipelineStage;

  const activeStep = script
    ? resolveActiveReviewStep(script, pipelineStage, loadedDraft?.hasVoiceover)
    : 2;
  const hasVoiceover = Boolean(
    script &&
      resolveReviewHasVoiceover(script, {
        pipelineStage,
        draftHasVoiceover: loadedDraft?.hasVoiceover,
      }),
  );
  const hasStoryboard = Boolean(script && script.scenes.length > 0);
  const hasNarration = Boolean(script?.narration?.trim());
  const scriptMode = resolveScriptMode(creationBrief?.scriptMode);
  const scriptModeLabel =
    SCRIPT_MODE_OPTIONS.find((option) => option.value === scriptMode)?.label ?? "Story";
  const voiceoverDurationMs =
    script != null
      ? getCanonicalVoiceover(script)?.durationMs ?? script.voiceoverDurationMs
      : undefined;
  const scriptVoiceoverUrl =
    script != null ? getCanonicalVoiceover(script)?.url : undefined;

  useEffect(() => {
    if (isLoading || isCreatingScenesRef.current || !loadedDraftRef.current) {
      return;
    }

    persistedVoiceoverUrlRef.current = getCanonicalVoiceover(scriptRef.current ?? undefined)?.url;
    scriptAutosaveReadyRef.current = false;
  }, [isLoading, loadedDraft?.id]);

  useEffect(() => {
    if (isLoading || isCreatingScenesRef.current || !loadedDraft) {
      return;
    }

    if (isEditorReadyDraft(loadedDraft)) {
      router.replace(`/editor/${draftId}`);
    }
  }, [draftId, isLoading, loadedDraft, router]);

  useEffect(() => {
    const currentScript = scriptRef.current;
    if (
      !currentScript ||
      isCreatingScenesRef.current ||
      currentScript.scenes.length > 0 ||
      pipelineStage === "editor_ready"
    ) {
      return;
    }

    if (!scriptAutosaveReadyRef.current) {
      scriptAutosaveReadyRef.current = true;
      return;
    }

    schedulePersist("script_review");

    setSaveMessage("Story saved.");

    if (saveMessageTimeoutRef.current != null) {
      window.clearTimeout(saveMessageTimeoutRef.current);
    }

    saveMessageTimeoutRef.current = window.setTimeout(() => {
      setSaveMessage(null);
    }, 2500);
  }, [pipelineStage, schedulePersist, script?.title, script?.narration, script?.scenes.length]);

  useEffect(() => {
    const currentScript = scriptRef.current;
    if (
      !currentScript ||
      isCreatingScenesRef.current ||
      currentScript.scenes.length > 0 ||
      pipelineStage === "editor_ready"
    ) {
      return;
    }

    const voiceoverUrl = getCanonicalVoiceover(currentScript)?.url;
    if (!voiceoverUrl) {
      return;
    }

    const isUnpersistedEphemeral =
      voiceoverUrl.startsWith("blob:") &&
      voiceoverUrl !== persistedVoiceoverUrlRef.current;

    if (!isUnpersistedEphemeral) {
      persistedVoiceoverUrlRef.current = voiceoverUrl;
      return;
    }

    persistedVoiceoverUrlRef.current = voiceoverUrl;
    schedulePersist("voiceover_ready");
    setSaveMessage("Narration saved.");
  }, [pipelineStage, schedulePersist, scriptVoiceoverUrl]);

  const handleStoryChange = useCallback(
    (next: FootieScript) => {
      updateScript((current) => syncFootieScript(applyStoryUpdate(current, next)));
      setSaveMessage(null);
    },
    [updateScript],
  );

  const handleSceneCountChange = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) {
        return;
      }

      const nextCount = Math.max(MIN_SCENE_COUNT, Math.min(MAX_SCENE_COUNT, Math.round(value)));
      setSceneCountOverride(nextCount);

      if (!creationBrief) {
        return;
      }

      setCreationBrief({ ...creationBrief, sceneCount: nextCount });
    },
    [creationBrief, setCreationBrief],
  );

  const handleOpenEditor = useCallback(() => {
    if (!script || script.scenes.length === 0) {
      setCreateScenesError("Build your storyboard before opening the editor.");
      return;
    }

    setCreateScenesError(null);
    router.push(`/editor/${draftId}`);
    void flushPersist("editor_ready");
  }, [draftId, flushPersist, router, script]);

  const handleCreateScenes = useCallback(async () => {
    if (!script || !creationBrief) {
      setCreateScenesError("Missing brief. Start again from Create.");
      return;
    }

    const measuredVoiceoverDurationMs =
      getCanonicalVoiceover(script)?.durationMs ?? script.voiceoverDurationMs;
    if (!measuredVoiceoverDurationMs || measuredVoiceoverDurationMs <= 0) {
      setCreateScenesError("Create narration before building your storyboard.");
      return;
    }

    isCreatingScenesRef.current = true;
    setIsCreatingScenes(true);
    setCreateScenesError(null);
    setScenesCreatedSuccessfully(false);
    setStoryboardStep(3);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "scenes-only",
          topic: creationBrief.topic,
          title: script.title,
          narration: script.narration,
          voiceoverDurationMs: measuredVoiceoverDurationMs,
          tone: creationBrief.tone,
          duration: creationBrief.duration,
          qualityMode: creationBrief.qualityMode,
          sceneCount,
          stream: true,
        }),
      });

      let data: GenerateScriptResponse;

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("ndjson")) {
        data = await consumeGenerateScriptStream(response, (step) => {
          setStoryboardStep(step);
        });
      } else {
        data = (await response.json()) as GenerateScriptResponse;
      }

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error ?? "Failed to build storyboard");
      }

      logCreateScenes("scenes API success", {
        sceneCount: data.data.scenes.length,
      });

      const nextScriptWithScenes = mergeStoryboardOntoScript(script, data.data);
      scriptAutosaveReadyRef.current = true;

      applyEditorReadyScript(nextScriptWithScenes);
      setScenesCreatedSuccessfully(true);
      isCreatingScenesRef.current = false;
      setIsCreatingScenes(false);

      router.push(`/editor/${draftId}`);

      void flushPersist("editor_ready", nextScriptWithScenes);
    } catch (error) {
      isCreatingScenesRef.current = false;
      setIsCreatingScenes(false);
      setScenesCreatedSuccessfully(false);
      setCreateScenesError(
        error instanceof Error ? error.message : "Failed to build storyboard",
      );
    }
  }, [applyEditorReadyScript, creationBrief, draftId, flushPersist, router, sceneCount, script]);

  useEffect(() => {
    return () => {
      if (saveMessageTimeoutRef.current != null) {
        window.clearTimeout(saveMessageTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return <DraftLoadingState />;
  }

  if (isNotFound || !loadedDraft || !script) {
    return (
      <AppShell
        hasProject={false}
        onCreateStory={() => router.push("/create")}
        onExport={() => undefined}
        exportDisabled
      >
        <div className={`${studioPanel} mx-auto max-w-lg space-y-5 px-5 py-10 text-center sm:px-8 sm:py-12`}>
          <h1 className={studioSectionTitle}>Draft not found</h1>
          <p className={studioSectionDesc}>
            This project could not be found. It may have been deleted or saved in another browser.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/drafts" className={studioPrimaryButton}>
              View drafts
            </Link>
            <Link href="/create" className={studioSecondaryButton}>
              Create
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      hasProject
      projectTitle={script.title}
      projectMeta="Story"
      onCreateStory={() => router.push("/create")}
      onExport={() => undefined}
      exportDisabled
      persistWarning={persistWarning}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <p className={studioStepLabel}>Story</p>
          <h1 className={studioSectionTitle}>Edit your story</h1>
          <p className={studioSectionDesc}>
            Refine your story, create narration, then build your storyboard before opening the editor.
          </p>
        </div>

        <Card>
          <p className={studioStepLabel}>Brief</p>
          <h2 className={`${studioSectionTitle} mt-1`}>Your brief</h2>
          <p className={`${studioSectionDesc} mb-5`}>
            Captured from Create — your brief settings carry forward.
          </p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className={`${studioPanel} space-y-1.5`}>
              <dt className={studioFieldLabel}>Story type</dt>
              <dd>
                <span className={studioBadge}>{scriptModeLabel}</span>
                <p className={`${studioSubtleText} mt-2`}>
                  {SCRIPT_MODE_OPTIONS.find((option) => option.value === scriptMode)?.description}
                </p>
              </dd>
            </div>
            <div className={`${studioPanel} space-y-1.5`}>
              <dt className={studioFieldLabel}>Target duration</dt>
              <dd className="text-sm text-foreground/90">
                {creationBrief?.duration ?? script.totalDuration}s
              </dd>
            </div>
            <div className={`${studioPanel} space-y-1.5 sm:col-span-2`}>
              <dt className={studioFieldLabel}>Original brief</dt>
              <dd className="text-sm leading-relaxed text-foreground/85">
                {creationBrief?.topic ?? script.title}
              </dd>
            </div>
            <div className={`${studioPanel} space-y-1.5 sm:col-span-2`}>
              <dt className={studioFieldLabel}>Additional Notes</dt>
              <dd className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap">
                {creationBrief?.context?.trim() ? creationBrief.context : "None provided"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <ol className="grid gap-3 sm:grid-cols-2">
            {REVIEW_STEPS.map((item) => {
              const done = item.step < activeStep || (item.step === 5 && hasStoryboard);
              const current = item.step === activeStep;

              return (
                <li
                  key={item.step}
                  className={`${studioPanel} ${current ? "ring-1 ring-accent/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    ) : (
                      <span
                        aria-hidden
                        className="mt-0.5 h-5 w-5 shrink-0 rounded-full ring-1 ring-border/30"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground/90">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{item.desc}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card>
          <StoryReview
            story={script}
            onStoryChange={handleStoryChange}
            variant="default"
            targetDurationSeconds={creationBrief?.duration ?? script.totalDuration}
          />
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border/30 pt-6">
            {saveMessage || autosaveSavedMessage ? (
              <p className={studioSubtleText} role="status" aria-live="polite">
                {saveMessage ?? autosaveSavedMessage}
              </p>
            ) : (
              <p className={studioSubtleText}>Edits save automatically.</p>
            )}
          </div>
        </Card>

        <Card>
          <p className={studioStepLabel}>Narration</p>
          <h2 className={`${studioSectionTitle} mt-1`}>Narration</h2>
          <p className={`${studioSectionDesc} mb-5`}>
            Pick a voice and create spoken audio from your current story.
          </p>
          <VoiceSettingsCard
            script={script}
            onScriptChange={handleStoryChange}
            disabled={isCreatingScenes}
            variant="review"
          />
        </Card>

        <Card className="space-y-5">
          <div>
            <p className={studioStepLabel}>Storyboard</p>
            <h2 className={`${studioSectionTitle} mt-1`}>Storyboard</h2>
            <p className={studioSectionDesc}>
              Build timed scenes from your story and narration. Nothing is created until you click the button below.
            </p>
          </div>

          <div className="max-w-xs">
            <label htmlFor="review-scene-count" className={studioFieldLabel}>
              Number of scenes
            </label>
            <input
              id="review-scene-count"
              type="number"
              min={MIN_SCENE_COUNT}
              max={MAX_SCENE_COUNT}
              step={1}
              value={sceneCount}
              onChange={(e) => handleSceneCountChange(Number(e.target.value))}
              disabled={isCreatingScenes || hasStoryboard || scenesCreatedSuccessfully}
              className={`${studioInput} mt-1.5 max-w-[8rem]`}
            />
          </div>

          {hasVoiceover && voiceoverDurationMs ? (
            <p className={studioSubtleText}>
              Narration duration: {Math.round(voiceoverDurationMs / 1000)}s — scenes will be timed to match.
            </p>
          ) : null}

          {isCreatingScenes ? (
            <StudioLoadingState
              topic={creationBrief?.topic ?? script.title}
              tone={creationBrief?.tone ?? "dramatic"}
              duration={creationBrief?.duration ?? script.totalDuration}
              loadingStep={storyboardStep}
            />
          ) : scenesCreatedSuccessfully || hasStoryboard ? (
            <div className="space-y-3">
              <p className={studioSubtleText} role="status" aria-live="polite">
                Storyboard ready. Open Editor
              </p>
              <button
                type="button"
                onClick={handleOpenEditor}
                className={`${studioPrimaryButton} w-full sm:w-auto`}
              >
                Open Editor
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleCreateScenes()}
              disabled={
                !hasNarration ||
                !hasVoiceover ||
                !voiceoverDurationMs ||
                voiceoverDurationMs <= 0 ||
                hasStoryboard
              }
              className={`${studioPrimaryButton} w-full sm:w-auto`}
            >
              Build Storyboard
            </button>
          )}

          {!hasVoiceover && !isCreatingScenes ? (
            <p className={studioSubtleText}>Create narration to synchronize your scenes.</p>
          ) : null}

          {createScenesError ? (
            <p className="text-sm text-red-300/90" role="alert">
              {createScenesError}
            </p>
          ) : null}
        </Card>

        {hasStoryboard || scenesCreatedSuccessfully ? (
          <Card className="space-y-4">
            <div>
              <p className={studioStepLabel}>Editor</p>
              <h2 className={`${studioSectionTitle} mt-1`}>Editor</h2>
              <p className={studioSectionDesc}>
                Open the editor to upload images, preview transitions, and export.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenEditor}
              className={`${studioPrimaryButton} inline-flex w-full sm:w-auto`}
            >
              Open Editor
            </button>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}

export default function ScriptReviewFlow({ draftId }: ScriptReviewFlowProps) {
  return <ScriptReviewFlowContent key={draftId} draftId={draftId} />;
}
