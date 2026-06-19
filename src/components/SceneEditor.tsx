"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Clock,
  Copy,
  ImagePlus,
  Layers,
  PlusCircle,
  SkipBack,
  SkipForward,
  Trash2,
  Timer,
  Workflow,
} from "lucide-react";
import { useEffect, useRef } from "react";

import {
  createEmptyScene,
  duplicateScene,
  recalculateSceneTimings,
} from "@/lib/timeline";
import {
  studioBadge,
  studioInput,
  studioSecondaryButton,
  studioSectionDesc,
  studioSectionTitle,
  studioStepLabel,
} from "@/lib/studioUi";
import { syncFootieScript } from "@/lib/voiceover";
import type { FootieScene, FootieScript, SceneType } from "@/types/footiebitz";

const SCENE_TYPE_OPTIONS: { value: SceneType; label: string }[] = [
  { value: "intro", label: "Intro" },
  { value: "context", label: "Context" },
  { value: "match", label: "Match" },
  { value: "transition", label: "Transition" },
  { value: "ending", label: "Ending" },
];

interface SceneEditorProps {
  script: FootieScript;
  onScriptChange: (script: FootieScript) => void;
  /** Index of the scene currently selected in the preview (used for Add Transition). */
  selectedSceneIndex?: number;
}

function isBlobUrl(url: string) {
  return url.startsWith("blob:");
}

function formatTimeRange(start: number, end: number): string {
  return `${start}s – ${end}s`;
}

export default function SceneEditor({ script, onScriptChange, selectedSceneIndex }: SceneEditorProps) {
  const managedBlobUrls = useRef<Set<string>>(new Set());

  const scenes = script.scenes;
  const totalDuration = script.totalDuration;
  const uploadedCount = scenes.filter((s) => s.uploadedImage).length;
  const uploadProgress = scenes.length
    ? Math.round((uploadedCount / scenes.length) * 100)
    : 0;

  // Commit an updated scene array — recalculates timings then syncs voiceover state.
  const commitScenes = (next: FootieScene[]) => {
    onScriptChange(syncFootieScript({ ...script, scenes: recalculateSceneTimings(next) }));
  };

  const updateScene = (id: string, patch: Partial<FootieScene>) => {
    commitScenes(scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  // ── Quick buffer scene inserts ───────────────────────────────────────────────

  const addIntroBuffer = () => {
    const intro = { ...createEmptyScene("intro"), duration: 3, subtitle: "Intro" };
    commitScenes([intro, ...scenes]);
  };

  const addContextBuffer = () => {
    const context = { ...createEmptyScene("context"), duration: 4, subtitle: "Context" };
    const insertAt = Math.min(1, scenes.length);
    const next = [...scenes];
    next.splice(insertAt, 0, context);
    commitScenes(next);
  };

  const addTransitionBuffer = () => {
    const transition = { ...createEmptyScene("transition"), duration: 2, subtitle: "Transition" };
    // Insert after selectedSceneIndex if valid, otherwise append.
    const insertAfter =
      selectedSceneIndex !== undefined && selectedSceneIndex >= 0 && selectedSceneIndex < scenes.length
        ? selectedSceneIndex
        : scenes.length - 1;
    const next = [...scenes];
    next.splice(insertAfter + 1, 0, transition);
    commitScenes(next);
  };

  const addEndingBuffer = () => {
    const ending = { ...createEmptyScene("ending"), duration: 4, subtitle: "Ending" };
    commitScenes([...scenes, ending]);
  };

  // ── Scene order / structure operations ──────────────────────────────────────

  const addBefore = (index: number) => {
    const next = [...scenes];
    next.splice(index, 0, createEmptyScene("transition"));
    commitScenes(next);
  };

  const addAfter = (index: number) => {
    const next = [...scenes];
    next.splice(index + 1, 0, createEmptyScene("transition"));
    commitScenes(next);
  };

  const duplicate = (index: number) => {
    const next = [...scenes];
    next.splice(index + 1, 0, duplicateScene(scenes[index]));
    commitScenes(next);
  };

  const deleteScene = (index: number) => {
    if (scenes.length <= 1) return;
    const removed = scenes[index];
    const imgUrl = removed.uploadedImage;
    // Only revoke the blob URL if no other scene shares it (e.g. after a duplicate).
    const isShared = imgUrl && scenes.some((s, i) => i !== index && s.uploadedImage === imgUrl);
    if (!isShared) revokeBlobUrl(imgUrl);
    commitScenes(scenes.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...scenes];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    commitScenes(next);
  };

  const moveDown = (index: number) => {
    if (index === scenes.length - 1) return;
    const next = [...scenes];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    commitScenes(next);
  };

  // ── Image helpers ────────────────────────────────────────────────────────────

  const revokeBlobUrl = (url: string | undefined) => {
    if (url && isBlobUrl(url) && managedBlobUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      managedBlobUrls.current.delete(url);
    }
  };

  const handleImageUpload = (id: string, file: File | null) => {
    if (!file) return;
    const existing = scenes.find((s) => s.id === id)?.uploadedImage;
    revokeBlobUrl(existing);

    try {
      const objectUrl = URL.createObjectURL(file);
      managedBlobUrls.current.add(objectUrl);
      updateScene(id, { uploadedImage: objectUrl });
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        updateScene(id, { uploadedImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id: string) => {
    const existing = scenes.find((s) => s.id === id)?.uploadedImage;
    revokeBlobUrl(existing);
    updateScene(id, { uploadedImage: undefined });
  };

  useEffect(() => {
    const blobs = managedBlobUrls.current;
    return () => {
      blobs.forEach((url) => URL.revokeObjectURL(url));
      blobs.clear();
    };
  }, []);

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={studioStepLabel}>Step 3</p>
          <h2 className={studioSectionTitle}>Production Timeline</h2>
          <p className={studioSectionDesc}>
            Adjust timing, subtitles, and images. Add, remove, or reorder scenes freely.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={studioBadge}>
            <Layers className="h-3.5 w-3.5" />
            {scenes.length} {scenes.length === 1 ? "scene" : "scenes"}
          </span>
          <span className={studioBadge}>
            <Clock className="h-3.5 w-3.5" />
            {totalDuration}s
          </span>
        </div>
      </div>

      {/* ── Helper note ── */}
      <div className="space-y-1.5 rounded-xl border border-zinc-800/60 bg-zinc-950/30 px-4 py-3.5 text-xs leading-relaxed text-zinc-500">
        <p>
          FootieBitz creates a first draft timeline. You can add intro, context, transition, or
          ending scenes to better match your narration.
        </p>
        <p className="text-zinc-600">
          Visual scenes do not change the narration. They control when images and subtitles appear.
        </p>
      </div>

      {/* ── Quick buffer inserts ── */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Workflow className="h-3.5 w-3.5 text-zinc-600" />
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
            Quick add
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addIntroBuffer}
            title="Insert a 3s intro scene at the beginning"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200"
          >
            <SkipBack className="h-3.5 w-3.5" />
            Add Intro Buffer
          </button>

          <button
            type="button"
            onClick={addContextBuffer}
            title="Insert a 4s context scene after the first scene"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Context Buffer
          </button>

          <button
            type="button"
            onClick={addTransitionBuffer}
            title={
              selectedSceneIndex !== undefined
                ? `Insert a 2s transition after scene ${selectedSceneIndex + 1}`
                : "Insert a 2s transition at the end"
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Add Transition
          </button>

          <button
            type="button"
            onClick={addEndingBuffer}
            title="Append a 4s ending scene at the end"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Add Ending
          </button>
        </div>
      </div>

      {/* ── Total timeline duration ── */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Clock className="h-4 w-4 text-zinc-500" />
          Total timeline
        </span>
        <span className="font-mono text-sm font-semibold text-zinc-200">
          {totalDuration}s
        </span>
      </div>

      {/* ── Upload progress ── */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-500">Images uploaded</span>
          <span className="text-amber-400/90">
            {uploadedCount}/{scenes.length}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-700/80 to-amber-500/70 transition-all duration-500"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>

      {/* ── Scene list ── */}
      <div className="relative space-y-0">
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-[1.125rem] top-4 w-px bg-gradient-to-b from-zinc-700 via-zinc-800 to-transparent"
        />

        {scenes.map((scene, index) => (
          <article key={scene.id} className="relative pb-7 last:pb-0">
            <div className="flex gap-4">
              {/* ── Step bubble ── */}
              <div className="relative z-10 flex w-9 shrink-0 flex-col items-center pt-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 ring-4 ring-zinc-950">
                  {index + 1}
                </span>
              </div>

              {/* ── Scene card ── */}
              <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/40">
                {/* Card header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-zinc-200">Scene {index + 1}</p>
                    {scene.sceneType && (
                      <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-0.5 text-[11px] font-medium capitalize text-zinc-500">
                        {scene.sceneType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                    <Timer className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{formatTimeRange(scene.start, scene.end)}</span>
                    <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px]">
                      {scene.duration}s
                    </span>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-5 p-5">
                  <div className="grid gap-5 sm:grid-cols-[120px_140px_1fr]">
                    <div>
                      <label
                        htmlFor={`duration-${scene.id}`}
                        className="mb-2 block text-sm font-medium text-zinc-300"
                      >
                        Duration
                      </label>
                      <input
                        id={`duration-${scene.id}`}
                        type="number"
                        min={1}
                        max={20}
                        value={scene.duration}
                        onChange={(e) => {
                          const raw = Number(e.target.value);
                          const clamped = Math.min(20, Math.max(1, Math.round(raw)));
                          updateScene(scene.id, {
                            duration: Number.isFinite(raw) && raw > 0 ? clamped : scene.duration,
                          });
                        }}
                        className={studioInput}
                      />
                      <p className="mt-1.5 text-[11px] text-zinc-600">1 – 20 seconds</p>
                    </div>

                    <div>
                      <label
                        htmlFor={`scene-type-${scene.id}`}
                        className="mb-2 block text-sm font-medium text-zinc-300"
                      >
                        Scene type
                      </label>
                      <div className="relative">
                        <select
                          id={`scene-type-${scene.id}`}
                          value={scene.sceneType ?? ""}
                          onChange={(e) =>
                            updateScene(scene.id, {
                              sceneType: e.target.value ? (e.target.value as SceneType) : undefined,
                            })
                          }
                          className={`${studioInput} appearance-none pr-8`}
                        >
                          <option value="">—</option>
                          {SCENE_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-zinc-600" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`subtitle-${scene.id}`}
                        className="mb-2 block text-sm font-medium text-zinc-300"
                      >
                        Subtitle
                      </label>
                      <textarea
                        id={`subtitle-${scene.id}`}
                        value={scene.subtitle}
                        onChange={(e) => updateScene(scene.id, { subtitle: e.target.value })}
                        rows={2}
                        placeholder="On-screen text for this scene"
                        className={`${studioInput} resize-none`}
                      />
                    </div>
                  </div>

                  {/* Image upload */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-zinc-300">Image</p>

                    {scene.uploadedImage ? (
                      <div className="space-y-3">
                        <div className="group relative overflow-hidden rounded-xl border border-zinc-800">
                          <img
                            src={scene.uploadedImage}
                            alt={`Scene ${index + 1} preview`}
                            className="aspect-[9/16] max-h-72 w-full object-cover transition duration-300 group-hover:scale-[1.01] sm:aspect-[16/10] sm:max-h-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <label className={`${studioSecondaryButton} cursor-pointer`}>
                            <ImagePlus className="h-4 w-4" />
                            Replace Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageUpload(scene.id, e.target.files?.[0] ?? null);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeImage(scene.id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950/30 px-6 py-10 text-center transition hover:border-zinc-600 hover:bg-zinc-900/40">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 transition group-hover:border-zinc-700">
                          <ImagePlus className="h-5 w-5 text-zinc-500" />
                        </div>
                        <p className="text-sm font-medium text-zinc-300">Upload image</p>
                        <p className="mt-1 text-xs text-zinc-600">PNG, JPG, or WEBP · 9:16 recommended</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleImageUpload(scene.id, e.target.files?.[0] ?? null);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* ── Scene action toolbar ── */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/60 pt-4">
                    <button
                      type="button"
                      onClick={() => addBefore(index)}
                      title="Insert a new scene before this one"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Before
                    </button>

                    <button
                      type="button"
                      onClick={() => addAfter(index)}
                      title="Insert a new scene after this one"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      Add After
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicate(index)}
                      title="Duplicate this scene"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </button>

                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      title="Move scene up"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                      Move Up
                    </button>

                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === scenes.length - 1}
                      title="Move scene down"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                      Move Down
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteScene(index)}
                      disabled={scenes.length <= 1}
                      title={scenes.length <= 1 ? "Cannot delete the only scene" : "Delete scene"}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-400/90 transition hover:border-red-900/70 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
