"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Film,
  Pause,
  Play,
  Smartphone,
  Square,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { getSceneIndexForTime } from "@/lib/sceneTiming";
import type { FootieScript, SceneType } from "@/types/footiebitz";

interface VideoPreviewProps {
  script: FootieScript | null;
  selectedSceneIndex: number;
  onSelectedSceneChange: (index: number) => void;
}

type PlaybackMode = "browser" | "narration";

// Label and subtle colour per scene type for the placeholder card.
const SCENE_TYPE_META: Record<SceneType, { label: string; color: string }> = {
  intro:      { label: "Intro",      color: "text-sky-400/80" },
  context:    { label: "Context",    color: "text-amber-400/80" },
  match:      { label: "Match",      color: "text-zinc-300" },
  transition: { label: "Transition", color: "text-violet-400/80" },
  ending:     { label: "Ending",     color: "text-zinc-400/80" },
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function VideoPreview({
  script,
  selectedSceneIndex,
  onSelectedSceneChange,
}: VideoPreviewProps) {
  const scenes = useMemo(() => script?.scenes ?? [], [script?.scenes]);
  const sceneCount = scenes.length;
  const totalDuration = script?.totalDuration ?? 0;
  const safeIndex = sceneCount > 0 ? Math.min(selectedSceneIndex, sceneCount - 1) : 0;
  const hasNarration = Boolean(script?.voiceoverUrl);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  // Elapsed seconds tracked for the progress bar (narration mode only).
  const [elapsedSec, setElapsedSec] = useState(0);
  const isClient = useIsClient();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);

  const isPlayingRef = useRef(false);
  const playbackModeRef = useRef<PlaybackMode | null>(null);
  const speakSceneRef = useRef<(index: number) => void>(() => {});
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const narrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceInitializedRef = useRef(false);
  const voiceSettingsRef = useRef({ rate: 1, pitch: 1, volume: 1, voiceURI: "" });

  const displayIndex = isPlaying ? currentSceneIndex : safeIndex;
  const scene = scenes[displayIndex];
  const isSceneActive = isSpeaking || (isPlaying && playbackMode === "narration");

  // ── Progress bar (narration mode) ────────────────────────────────────────────
  const progressPct =
    totalDuration > 0 && playbackMode === "narration"
      ? Math.min(100, Math.round((elapsedSec / totalDuration) * 100))
      : 0;

  // ── Core playback control helpers ─────────────────────────────────────────────

  const clearAdvanceTimeout = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const stopNarrationAudio = useCallback(() => {
    const audio = narrationAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const resetTimeline = useCallback(() => {
    setCurrentSceneIndex(0);
    setElapsedSec(0);
    onSelectedSceneChange(0);
  }, [onSelectedSceneChange]);

  const stopVoice = useCallback(() => {
    clearAdvanceTimeout();
    stopNarrationAudio();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isPlayingRef.current = false;
    playbackModeRef.current = null;
    setIsPlaying(false);
    setIsSpeaking(false);
    setPlaybackMode(null);
    resetTimeline();
  }, [clearAdvanceTimeout, resetTimeline, stopNarrationAudio]);

  const pauseVoice = useCallback(() => {
    clearAdvanceTimeout();
    if (playbackModeRef.current === "narration") {
      narrationAudioRef.current?.pause();
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsSpeaking(false);
  }, [clearAdvanceTimeout]);

  // Sync the visible scene to the audio's current time (narration mode).
  const syncSceneToAudioTime = useCallback(
    (currentTimeSec: number) => {
      const index = getSceneIndexForTime(currentTimeSec, scenes);
      setCurrentSceneIndex(index);
      setElapsedSec(currentTimeSec);
      onSelectedSceneChange(index);
    },
    [onSelectedSceneChange, scenes],
  );

  // ── Browser-voice mode ────────────────────────────────────────────────────────
  // Each scene is held for exactly scene.duration seconds of wall-clock time.
  // Audio is spoken subtitle text; the timer fires for the remaining duration
  // after speech ends (so long subtitles don't overstay their scene).

  const scheduleAdvanceAfterScene = useCallback(
    (index: number, sceneStartTime: number) => {
      const sceneDurationMs = Math.max(1, scenes[index]?.duration ?? 5) * 1000;
      const elapsedMs = Date.now() - sceneStartTime;
      const remainingMs = Math.max(0, sceneDurationMs - elapsedMs);

      clearAdvanceTimeout();
      advanceTimeoutRef.current = setTimeout(() => {
        advanceTimeoutRef.current = null;
        if (!isPlayingRef.current) return;
        if (index + 1 < sceneCount) {
          speakSceneRef.current(index + 1);
        } else {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setIsSpeaking(false);
        }
      }, remainingMs);
    },
    [clearAdvanceTimeout, sceneCount, scenes],
  );

  const speakSceneAt = useCallback(
    (index: number) => {
      if (!script || index >= sceneCount || !isPlayingRef.current) {
        stopVoice();
        return;
      }

      clearAdvanceTimeout();
      const sceneStartTime = Date.now();
      const subtitle = scenes[index]?.subtitle?.trim();

      setCurrentSceneIndex(index);
      onSelectedSceneChange(index);

      // If no subtitle text, just hold the scene for its duration.
      if (!subtitle || subtitle === "Add subtitle...") {
        setIsSpeaking(false);
        scheduleAdvanceAfterScene(index, sceneStartTime);
        return;
      }

      setIsSpeaking(true);

      if (typeof window === "undefined" || !window.speechSynthesis) {
        stopVoice();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(subtitle);
      const { rate, pitch, volume, voiceURI } = voiceSettingsRef.current;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        setIsSpeaking(false);
        if (!isPlayingRef.current) return;
        scheduleAdvanceAfterScene(index, sceneStartTime);
      };
      utterance.onerror = () => stopVoice();

      window.speechSynthesis.speak(utterance);
    },
    [
      clearAdvanceTimeout,
      onSelectedSceneChange,
      sceneCount,
      scenes,
      scheduleAdvanceAfterScene,
      script,
      stopVoice,
    ],
  );

  useEffect(() => {
    speakSceneRef.current = speakSceneAt;
  }, [speakSceneAt]);

  useEffect(() => {
    voiceSettingsRef.current = { rate: speechRate, pitch: speechPitch, volume: speechVolume, voiceURI: selectedVoiceURI };
  }, [speechRate, speechPitch, speechVolume, selectedVoiceURI]);

  // Load system voices.
  useEffect(() => {
    if (!isClient || typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      if (!voiceInitializedRef.current && available.length > 0) {
        const preferred =
          available.find((v) => v.default) ??
          available.find((v) => v.lang.startsWith("en")) ??
          available[0];
        setSelectedVoiceURI(preferred.voiceURI);
        voiceInitializedRef.current = true;
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isClient]);

  // ── Narration playback (plays the MP3 from time 0; scenes follow along) ──────

  const playWithBrowserVoice = useCallback(() => {
    if (sceneCount === 0) return;
    stopNarrationAudio();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    playbackModeRef.current = "browser";
    setPlaybackMode("browser");
    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentSceneIndex(0);
    onSelectedSceneChange(0);
    speakSceneAt(0);
  }, [onSelectedSceneChange, sceneCount, speakSceneAt, stopNarrationAudio]);

  const playPreview = async () => {
    const voiceoverUrl = script?.voiceoverUrl;
    if (sceneCount === 0 || !voiceoverUrl) return;

    if (!narrationAudioRef.current) {
      narrationAudioRef.current = new Audio(voiceoverUrl);
    }

    const playbackAudio = narrationAudioRef.current;

    clearAdvanceTimeout();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();

    playbackModeRef.current = "narration";
    setPlaybackMode("narration");
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsSpeaking(false);

    // Always start from the beginning of the timeline.
    playbackAudio.pause();
    playbackAudio.currentTime = 0;
    setCurrentSceneIndex(0);
    setElapsedSec(0);
    onSelectedSceneChange(0);

    try {
      await playbackAudio.play();
    } catch {
      stopVoice();
    }
  };

  // Wire up the narration audio element. Audio runs uninterrupted;
  // timeupdate drives scene switching via start/end timings.
  useEffect(() => {
    if (!script?.voiceoverUrl) {
      narrationAudioRef.current = null;
      return;
    }

    const audio = new Audio(script.voiceoverUrl);
    narrationAudioRef.current = audio;

    const handleTimeUpdate = () => {
      if (!isPlayingRef.current || playbackModeRef.current !== "narration") return;
      syncSceneToAudioTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (playbackModeRef.current !== "narration") return;
      stopVoice();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
      if (narrationAudioRef.current === audio) narrationAudioRef.current = null;
      if (playbackModeRef.current === "narration") {
        isPlayingRef.current = false;
        playbackModeRef.current = null;
      }
    };
  }, [script?.voiceoverUrl, stopVoice, syncSceneToAudioTime]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      clearAdvanceTimeout();
      stopNarrationAudio();
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
      isPlayingRef.current = false;
      playbackModeRef.current = null;
    };
  }, [clearAdvanceTimeout, stopNarrationAudio]);

  const goPrevious = () => {
    if (isPlaying || safeIndex <= 0) return;
    onSelectedSceneChange(safeIndex - 1);
  };

  const goNext = () => {
    if (isPlaying || safeIndex >= sceneCount - 1) return;
    onSelectedSceneChange(safeIndex + 1);
  };

  // ── Empty state ───────────────────────────────────────────────────────────────

  if (!script || sceneCount === 0 || !scene) {
    return (
      <div className="relative mx-auto w-full max-w-[300px]">
        <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/40 p-3 shadow-lg shadow-black/20">
          <div className="flex aspect-[9/16] flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 px-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80">
              <Smartphone className="h-7 w-7 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">Preview your short</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">
              Create a story and your 9:16 storyboard will appear here scene by scene.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-[11px] text-zinc-500">
              <Play className="h-3 w-3" />
              Visual preview only
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Scene placeholder (no uploaded image) ─────────────────────────────────────

  const sceneTypeMeta = scene.sceneType ? SCENE_TYPE_META[scene.sceneType] : null;

  const scenePlaceholderJsx = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-black px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80">
        <Film className="h-6 w-6 text-zinc-600" />
      </div>
      {sceneTypeMeta ? (
        <p className={`text-[11px] font-semibold uppercase tracking-widest ${sceneTypeMeta.color}`}>
          {sceneTypeMeta.label}
        </p>
      ) : (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Scene {displayIndex + 1}
        </p>
      )}
      {scene.subtitle && scene.subtitle !== "Add subtitle..." && (
        <p className="mt-3 line-clamp-5 text-[11px] leading-relaxed text-zinc-500">
          {scene.subtitle}
        </p>
      )}
      <p className="mt-4 font-mono text-[10px] text-zinc-700">
        {scene.start}s – {scene.end}s
      </p>
    </div>
  );

  // ── Main preview ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex w-full max-w-[300px] flex-col gap-5">
      <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/40 p-3 shadow-lg shadow-black/20">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-black">
          {/* Notch */}
          <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-2">
            <div className="h-1 w-16 rounded-full bg-white/20" />
          </div>

          {/* Scene image or placeholder */}
          {scene.uploadedImage ? (
            <img
              src={scene.uploadedImage}
              alt={`Scene ${displayIndex + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            scenePlaceholderJsx
          )}

          {/* Gradient overlay (always on top of image for text legibility) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50" />

          {/* Top: branding + title */}
          <div className="absolute inset-x-0 top-0 z-10 p-5 pt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
              FootieBitz
            </p>
            <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-white">
              {script.title}
            </h3>
          </div>

          {/* Bottom: subtitle + scene meta */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-5">
            {scene.subtitle && scene.subtitle !== "Add subtitle..." && (
              <p
                className={`text-center text-[15px] font-bold leading-snug text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] transition ${
                  isSceneActive ? "scale-[1.02] rounded-lg px-2 py-1 ring-1 ring-white/20" : ""
                }`}
              >
                {scene.subtitle}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {scene.sceneType && (
                <span className={`text-[10px] font-semibold capitalize ${sceneTypeMeta?.color ?? "text-zinc-500"}`}>
                  {scene.sceneType}
                </span>
              )}
              <span className="font-mono text-[10px] text-zinc-500">
                {scene.start}s – {scene.end}s
              </span>
              {isSpeaking && <span className="text-[10px] text-sky-400/90">· Speaking</span>}
              {isPlaying && playbackMode === "narration" && (
                <span className="text-[10px] text-violet-400">· Narration</span>
              )}
            </div>

            {/* Timeline progress bar — visible during narration playback */}
            {playbackMode === "narration" && totalDuration > 0 && (
              <div className="mt-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-0.5 rounded-full bg-violet-400/70 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Browser voice settings (client-only) */}
      {isClient && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Browser voice settings
          </p>

          <div className="space-y-3">
            <div>
              <label htmlFor="preview-voice" className="mb-1.5 block text-[11px] text-zinc-500">
                Voice
              </label>
              <div className="relative">
                <select
                  id="preview-voice"
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  disabled={isPlaying}
                  className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 pr-8 text-xs text-zinc-100 outline-none transition focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {voices.length === 0 ? (
                    <option value="">Loading voices...</option>
                  ) : (
                    voices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-1">
                <span className="flex justify-between text-[10px] text-zinc-500">
                  Rate <span className="text-zinc-400">{speechRate.toFixed(1)}</span>
                </span>
                <input type="range" min={0.8} max={1.2} step={0.05} value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))} disabled={isPlaying}
                  className="h-1.5 w-full cursor-pointer accent-zinc-400 disabled:cursor-not-allowed disabled:opacity-50" />
              </label>
              <label className="space-y-1">
                <span className="flex justify-between text-[10px] text-zinc-500">
                  Pitch <span className="text-zinc-400">{speechPitch.toFixed(1)}</span>
                </span>
                <input type="range" min={0.8} max={1.2} step={0.05} value={speechPitch}
                  onChange={(e) => setSpeechPitch(Number(e.target.value))} disabled={isPlaying}
                  className="h-1.5 w-full cursor-pointer accent-zinc-400 disabled:cursor-not-allowed disabled:opacity-50" />
              </label>
              <label className="space-y-1">
                <span className="flex justify-between text-[10px] text-zinc-500">
                  Vol <span className="text-zinc-400">{speechVolume.toFixed(1)}</span>
                </span>
                <input type="range" min={0} max={1} step={0.05} value={speechVolume}
                  onChange={(e) => setSpeechVolume(Number(e.target.value))} disabled={isPlaying}
                  className="h-1.5 w-full cursor-pointer accent-zinc-400 disabled:cursor-not-allowed disabled:opacity-50" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Playback controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={playPreview}
          disabled={isPlaying || !hasNarration}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-900/50 bg-violet-950/30 px-3 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-950/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5" />
          Play Preview
        </button>
        <button
          type="button"
          onClick={playWithBrowserVoice}
          disabled={isPlaying}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Browser Voice
        </button>
        <button
          type="button"
          onClick={pauseVoice}
          disabled={!isPlaying && !isSpeaking}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Pause className="h-3.5 w-3.5" />
          Pause
        </button>
        <button
          type="button"
          onClick={stopVoice}
          disabled={!isPlaying && !isSpeaking}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Square className="h-3.5 w-3.5" />
          Stop
        </button>
      </div>

      {!hasNarration && (
        <p className="text-center text-[11px] leading-relaxed text-zinc-500">
          Create narration in step 4 to unlock Play Preview.
        </p>
      )}

      {/* Scene dots */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {scenes.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => { if (!isPlaying) onSelectedSceneChange(index); }}
            disabled={isPlaying}
            aria-label={`Scene ${index + 1}${s.sceneType ? ` (${s.sceneType})` : ""}`}
            aria-current={index === displayIndex ? "true" : undefined}
            title={s.sceneType ? `${s.sceneType} · ${s.start}s–${s.end}s` : `Scene ${index + 1} · ${s.start}s–${s.end}s`}
            className={`rounded-full transition-all duration-200 disabled:cursor-default ${
              index === displayIndex
                ? isSceneActive
                  ? playbackMode === "narration"
                    ? "h-2 w-7 animate-pulse bg-violet-400/80 shadow-sm shadow-violet-400/30"
                    : "h-2 w-7 animate-pulse bg-sky-400/80 shadow-sm shadow-sky-400/30"
                  : isPlaying
                    ? playbackMode === "narration"
                      ? "h-2 w-7 bg-violet-500/70"
                      : "h-2 w-7 bg-sky-500/70"
                    : "h-2 w-7 bg-zinc-500/70"
                : s.uploadedImage
                  ? "h-2 w-2 bg-zinc-500/60 hover:bg-zinc-400/70"
                  : "h-2 w-2 bg-zinc-700/80 hover:bg-zinc-600"
            }`}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrevious}
          disabled={isPlaying || safeIndex === 0}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <span className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs font-semibold text-zinc-500">
          {displayIndex + 1}/{sceneCount}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={isPlaying || safeIndex >= sceneCount - 1}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
