"use client";

import type { FootieScript, SceneType, TimelineItem } from "@/features/story/types";

import {
  assertExportPayload,
  buildFootieExportPayload,
  countExportTransitions,
  formatExportSceneTiming,
  getExportTotalDurationSec,
  getRenderableScenesFromPayload,
  isTransitionVideoContent,
  type ExportScene,
  type FootieExportPayload,
} from "./export-payload.service";
import { downloadBlob, fetchBackgroundMusicBlob, fetchNarrationBlob } from "@/features/export/utils/download.utils";
import {
  EXPORT_BACKGROUND_MUSIC_FALLBACK_WARNING,
  EXPORT_BACKGROUND_MUSIC_MIXING_ENABLED,
  EXPORT_BACKGROUND_MUSIC_PARTIAL_FALLBACK_WARNING,
  isExportBackgroundMusicActive,
  resolveExportBackgroundMusicMixSettings,
} from "@/features/export/utils/export-background-music.utils";
import { resolvePreviewBackgroundMusicUrl } from "@/features/preview/utils";
import { getStoryBackgroundMusic } from "@/features/story/utils";
import {
  type ExportProgress,
  type ExportQualityPreset,
  type FootieExportOptions,
} from "@/features/export/utils/export-quality.utils";
import {
  buildExportDownloadFileName,
  resolveEffectiveExportSettings,
  resolveExportRenderPreset,
  resolveExportSettings,
} from "@/features/export/utils/export-settings.utils";
import {
  drawExportGeneratedCaption,
  drawExportSubtitlesCaption,
  resetExportCanvasDrawState,
} from "@/features/export/utils/export-caption-canvas.utils";
import { drawExportTransitionBackgrounds } from "@/features/export/utils/export-transition-canvas.utils";
import { resolveExportSubtitleDisplay } from "@/features/export/utils/export-subtitle.utils";
import { resolveSceneTransitionOverlay } from "@/features/story/utils/transition-overlay.utils";
import type { SceneTransitionOverlay } from "@/features/story/utils/transition-overlay.utils";
import {
  getExportSceneCaptionLines,
  getSceneDurationMs,
  getSceneTimingAtGlobalTime,
  normalizeCaptionMode,
  resolveStoryDurationSec,
  drawSceneImageInFrame,
  getSceneImageUrl,
  resolveExportSceneImage,
  resolveSceneImageMotionProgress,
  resolveSceneImageMotionScale,
} from "@/features/story/utils";

function assertBrowserExportEnvironment(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Video export is only available in the browser");
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function requestCanvasCaptureFrame(stream: MediaStream): void {
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
  track.requestFrame?.();
}

function getSupportedMimeType(): string {
  const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "video/webm";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("blob:") && !src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load scene image"));
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = "left",
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = align;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) ctx.fillText(line, x, currentY);
  ctx.textAlign = previousAlign;
}

// Per-scene-type top colour for the placeholder gradient.
const SCENE_TYPE_TOP_COLOR: Record<SceneType, string> = {
  intro:      "#0c1a2e", // dark navy
  context:    "#1a1400", // dark amber-brown
  match:      "#0a0f18", // near-black blue
  transition: "#120c1e", // dark violet
  ending:     "#0f0f0f", // near-black neutral
};

const DEFAULT_TOP_COLOR = "#0a0f18";

function drawPlaceholderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sceneType: SceneType | undefined,
) {
  const topColor = sceneType ? SCENE_TYPE_TOP_COLOR[sceneType] : DEFAULT_TOP_COLOR;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(0.5, "#18181b");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export interface ExportFrameTiming {
  sceneElapsedMs: number;
  sceneDurationMs: number;
}

function resolveExportFrameTiming(
  scenes: ExportScene[],
  timeSec: number,
): { scene: ExportScene; sceneIndex: number; timing: ExportFrameTiming } {
  const timingAt = getSceneTimingAtGlobalTime(scenes, timeSec * 1000);
  const sceneIndex = timingAt?.slot.index ?? 0;
  const scene = scenes[sceneIndex] ?? scenes[0]!;

  return {
    scene,
    sceneIndex,
    timing: {
      sceneElapsedMs: timingAt?.sceneElapsedMs ?? 0,
      sceneDurationMs: timingAt?.sceneDurationMs ?? getSceneDurationMs(scene),
    },
  };
}

function drawSceneBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: ExportScene,
  image: HTMLImageElement | null,
  motionProgress = 0,
) {
  if (image) {
    const sceneImage = resolveExportSceneImage(scene);
    const motionScale = resolveSceneImageMotionScale(sceneImage?.imageMotion, motionProgress);

    if (sceneImage) {
      drawSceneImageInFrame(
        ctx,
        image,
        width,
        height,
        sceneImage,
        image.naturalWidth,
        image.naturalHeight,
        motionScale,
      );
    } else {
      ctx.drawImage(image, 0, 0, width, height);
    }
  } else {
    drawPlaceholderBackground(ctx, width, height, scene.sceneType);
  }
}

function drawSceneFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  script: FootieScript,
  scene: ExportScene,
  image: HTMLImageElement | null,
  timing: ExportFrameTiming,
  transitionOverlay: SceneTransitionOverlay | null,
  transitionImages: { from: HTMLImageElement | null; to: HTMLImageElement | null } | null,
) {
  const scale = width / 1080;
  const padX = 72 * scale;
  const titleY = 180 * scale;
  const subtitleY = height - 320 * scale;

  resetExportCanvasDrawState(ctx);
  ctx.clearRect(0, 0, width, height);

  const sceneMotionProgress = resolveSceneImageMotionProgress(
    timing.sceneElapsedMs,
    timing.sceneDurationMs,
  );

  // ── Background ─────────────────────────────────────────────────────────────
  if (transitionOverlay && transitionImages) {
    drawExportTransitionBackgrounds(ctx, width, height, {
      effect: transitionOverlay.effect,
      progress: transitionOverlay.progress,
      drawFromBackground: (layerCtx, layerWidth, layerHeight) => {
        drawSceneBackground(
          layerCtx,
          layerWidth,
          layerHeight,
          transitionOverlay.fromScene as ExportScene,
          transitionImages.from,
          sceneMotionProgress,
        );
      },
      drawToBackground: (layerCtx, layerWidth, layerHeight) => {
        drawSceneBackground(
          layerCtx,
          layerWidth,
          layerHeight,
          transitionOverlay.toScene as ExportScene,
          transitionImages.to,
          0,
        );
      },
    });
  } else {
    drawSceneBackground(ctx, width, height, scene, image, sceneMotionProgress);
  }

  // Gradient overlay for text legibility.
  const overlay = ctx.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, "rgba(0,0,0,0.60)");
  overlay.addColorStop(0.35, "rgba(0,0,0,0.15)");
  overlay.addColorStop(1, "rgba(0,0,0,0.90)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  // ── Branding ───────────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `bold ${36 * scale}px Arial, Helvetica, sans-serif`;
  ctx.fillText("FOOTIEBITZ", padX, 116 * scale);

  // ── Title ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${48 * scale}px Arial, Helvetica, sans-serif`;
  wrapText(ctx, script.title, padX, titleY, width - padX * 2, 58 * scale);

  // ── Scene type label on placeholder (no image) ─────────────────────────────
  if (!image && !transitionOverlay && scene.sceneType) {
    ctx.fillStyle = "rgba(255,255,255,0.30)";
    ctx.font = `bold ${32 * scale}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(scene.sceneType.toUpperCase(), width / 2, height / 2);
    ctx.textAlign = "left";
  }

  // ── On-screen caption (generated or timed narration subtitles) ───────────
  // Hidden during transition overlay — matches preview behavior.
  if (transitionOverlay) {
    return;
  }

  const captionTiming = timing;

  if (normalizeCaptionMode(scene.captionMode) === "subtitles") {
    const subtitleDisplay = resolveExportSubtitleDisplay(scene, captionTiming);
    if (subtitleDisplay) {
      drawExportSubtitlesCaption({
        ctx,
        width,
        height,
        subtitleY,
        scale,
        display: subtitleDisplay,
      });
    }
  } else {
    const captionLines = getExportSceneCaptionLines(scene, captionTiming).filter(
      (line) => !isTransitionVideoContent(line),
    );
    if (captionLines.length > 0) {
      drawExportGeneratedCaption(ctx, captionLines, width, height, subtitleY, scale);
    }
  }
}

function mapRenderingProgress(
  progress: ExportProgress,
  hasVoiceover: boolean,
): ExportProgress {
  if (!hasVoiceover) {
    return progress;
  }

  if (progress.status === "rendering" || progress.status === "preparing") {
    return {
      ...progress,
      progress: Math.min(70, Math.round(progress.progress * 0.7)),
      message:
        progress.status === "preparing"
          ? progress.message
          : progress.message.replace(/^Recording video\.\.\.$/, "Rendering video"),
    };
  }

  if (progress.status === "finalizing") {
    return {
      status: "rendering",
      progress: 70,
      message: "Rendering video",
    };
  }

  return progress;
}

export async function exportSilentVideoBlob(
  script: FootieScript,
  qualityPreset: ExportQualityPreset,
  onProgress?: (progress: ExportProgress) => void,
  payloadOverride?: FootieExportPayload,
): Promise<Blob> {
  assertBrowserExportEnvironment();

  const payload = payloadOverride ?? buildFootieExportPayload(script);
  assertExportPayload(payload);

  // Tail-of-scene transition overlays use timeline metadata; transition items are
  // never rendered as standalone video segments.
  const scenes = getRenderableScenesFromPayload(payload);
  const transitionCount = countExportTransitions(payload);

  if (scenes.length === 0) {
    throw new Error("No scenes to export");
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not supported in this browser");
  }

  const { width, height, fps, bitrate, label } = qualityPreset;

  onProgress?.({
    status: "preparing",
    progress: 0,
    message:
      transitionCount > 0
        ? `Preparing ${label} export (${width}×${height} @ ${fps}fps) · ${transitionCount} transitions queued`
        : `Preparing ${label} export (${width}×${height} @ ${fps}fps)...`,
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not supported");
  }

  const imageCache = new Map<string, HTMLImageElement>();
  for (const scene of scenes) {
    const imageUrl = getSceneImageUrl(scene);
    if (imageUrl) {
      try {
        const img = await loadImage(imageUrl);
        imageCache.set(scene.id, img);
      } catch {
        // Fall back to gradient placeholder for this scene.
      }
    }
  }

  const mimeType = getSupportedMimeType();
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const totalDurationSec = Math.max(
    getExportTotalDurationSec(payload),
    resolveStoryDurationSec(script),
    0.001,
  );
  const totalFrames = Math.max(1, Math.round(totalDurationSec * fps));
  const frameMs = 1000 / fps;
  let renderedFrames = 0;

  onProgress?.({ status: "rendering", progress: 2, message: "Rendering video" });
  recorder.start(250);

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const timeSec = frameIndex / fps;
    const { scene, sceneIndex, timing } = resolveExportFrameTiming(scenes, timeSec);

    const image = imageCache.get(scene.id) ?? null;
    const transitionOverlay = resolveSceneTransitionOverlay(
      scenes,
      payload.timelineItems as TimelineItem[],
      sceneIndex,
      timing.sceneElapsedMs,
      timing.sceneDurationMs,
    );
    const transitionImages = transitionOverlay
      ? {
          from: imageCache.get(transitionOverlay.fromScene.id) ?? null,
          to: imageCache.get(transitionOverlay.toScene.id) ?? null,
        }
      : null;

    drawSceneFrame(
      ctx,
      width,
      height,
      script,
      scene,
      image,
      timing,
      transitionOverlay,
      transitionImages,
    );
    requestCanvasCaptureFrame(stream);
    renderedFrames++;
    const progress = Math.min(99, Math.round((renderedFrames / totalFrames) * 100));
    onProgress?.({
      status: "rendering",
      progress,
      message: `Rendering scene ${sceneIndex + 1} (${formatExportSceneTiming(scene)}) at ${label}...`,
    });
    await sleep(frameMs);
  }

  onProgress?.({ status: "finalizing", progress: 99, message: "Finalizing video..." });

  await new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("Recording failed"));
    recorder.stop();
  });

  stream.getTracks().forEach((track) => track.stop());

  if (chunks.length === 0) {
    throw new Error("Export produced no video data");
  }

  return new Blob(chunks, { type: mimeType.split(";")[0] });
}

function getDownloadFormatFromBlob(blob: Blob): "mp4" | "webm" {
  return blob.type.toLowerCase().includes("mp4") ? "mp4" : "webm";
}

export async function exportFootieShort(
  script: FootieScript,
  onProgress: (progress: ExportProgress) => void,
  options: FootieExportOptions = {},
): Promise<void> {
  assertBrowserExportEnvironment();

  const requestedSettings = resolveExportSettings(script, options);
  const { settings: exportSettings, formatFallback } =
    resolveEffectiveExportSettings(requestedSettings);
  const payload = buildFootieExportPayload(script);
  const quality = resolveExportRenderPreset(script, options);
  const exportDurationSec = getExportTotalDurationSec(payload);
  const includeNarration =
    options.audioMode === "with-voice" && Boolean(payload.voiceoverUrl);
  const formatWarning = formatFallback
    ? "WebM export is coming soon — downloaded as MP4 instead."
    : undefined;

  const silentBlob = await exportSilentVideoBlob(script, quality, (update) => {
    onProgress(mapRenderingProgress(update, includeNarration));
  }, payload);

  let finalBlob = silentBlob;
  let musicWarning: string | undefined;
  const backgroundMusicActive = isExportBackgroundMusicActive(script);
  const musicMixSettings = backgroundMusicActive
    ? resolveExportBackgroundMusicMixSettings(script, includeNarration)
    : null;
  const backgroundMusicSettings = getStoryBackgroundMusic(script);
  let backgroundMusicBlob: Blob | undefined;
  let audioMixed = false;

  if (backgroundMusicActive && !EXPORT_BACKGROUND_MUSIC_MIXING_ENABLED) {
    musicWarning = EXPORT_BACKGROUND_MUSIC_FALLBACK_WARNING;
  }

  const shouldAttemptMusicMix =
    Boolean(
      backgroundMusicActive &&
        EXPORT_BACKGROUND_MUSIC_MIXING_ENABLED &&
        musicMixSettings &&
        resolvePreviewBackgroundMusicUrl(script),
    );

  if (shouldAttemptMusicMix) {
    onProgress({
      status: "loading-voiceover",
      progress: 70,
      message: "Loading background music",
    });

    try {
      backgroundMusicBlob = await fetchBackgroundMusicBlob(resolvePreviewBackgroundMusicUrl(script)!);
    } catch {
      backgroundMusicBlob = undefined;
      musicWarning = EXPORT_BACKGROUND_MUSIC_FALLBACK_WARNING;
    }
  }

  const shouldMuxAudio =
    Boolean(includeNarration && payload.voiceoverUrl) ||
    Boolean(backgroundMusicBlob && musicMixSettings);

  if (shouldMuxAudio) {
    onProgress({
      status: "loading-voiceover",
      progress: 72,
      message: includeNarration ? "Loading narration" : "Preparing audio mix",
    });

    let voiceoverBlob: Blob | undefined;
    if (includeNarration && payload.voiceoverUrl) {
      voiceoverBlob = await fetchNarrationBlob(payload.voiceoverUrl);
    }

    onProgress({
      status: "combining",
      progress: 78,
      message: backgroundMusicBlob
        ? "Mixing narration and background music (0%)"
        : "Combining audio (0%)",
    });

    try {
      const { muxVideoWithExportAudio } = await import("@/features/export/utils/ffmpeg.utils");
      finalBlob = await muxVideoWithExportAudio(silentBlob, {
        videoDurationSec: exportDurationSec,
        voiceoverBlob,
        backgroundMusicBlob,
        backgroundMusicFileName: backgroundMusicSettings.fileName,
        backgroundMusicMix: musicMixSettings ?? undefined,
        onProgress: (muxPercent) => {
          onProgress({
            status: "combining",
            progress: 78 + Math.round(muxPercent * 0.12),
            message: backgroundMusicBlob
              ? `Mixing narration and background music (${muxPercent}%)`
              : `Combining audio (${muxPercent}%)`,
          });
        },
      });
      audioMixed = true;
    } catch (error) {
      const mergeError = error instanceof Error ? error.message : "Audio merge failed";

      if (includeNarration && voiceoverBlob) {
        try {
          const { muxVideoWithAudio } = await import("@/features/export/utils/ffmpeg.utils");
          finalBlob = await muxVideoWithAudio(silentBlob, voiceoverBlob, {
            videoDurationSec: exportDurationSec,
          });
          audioMixed = true;
          musicWarning = EXPORT_BACKGROUND_MUSIC_PARTIAL_FALLBACK_WARNING;
        } catch {
          finalBlob = silentBlob;
          audioMixed = false;

          if (exportSettings.format === "mp4") {
            onProgress({
              status: "finalizing",
              progress: 90,
              message: "Converting to MP4...",
            });

            try {
              const { transcodeWebmToMp4 } = await import("@/features/export/utils/ffmpeg.utils");
              finalBlob = await transcodeWebmToMp4(finalBlob, { hasAudio: false });
            } catch {
              // Fall back to silent WebM when MP4 transcode also fails.
            }
          }

          const filename = buildExportDownloadFileName(
            exportSettings,
            getDownloadFormatFromBlob(finalBlob),
          );

          downloadBlob(finalBlob, filename);

          onProgress({
            status: "done",
            progress: 100,
            message: `Downloaded silent video (${filename}) — audio merge failed`,
            warning: mergeError,
          });
          return;
        }
      } else {
        finalBlob = silentBlob;
        musicWarning = EXPORT_BACKGROUND_MUSIC_FALLBACK_WARNING;

        if (exportSettings.format === "mp4") {
          onProgress({
            status: "finalizing",
            progress: 90,
            message: "Converting to MP4...",
          });

          try {
            const { transcodeWebmToMp4 } = await import("@/features/export/utils/ffmpeg.utils");
            finalBlob = await transcodeWebmToMp4(finalBlob, { hasAudio: false });
          } catch {
            // Fall back to silent WebM when MP4 transcode also fails.
          }
        }

        const filename = buildExportDownloadFileName(
          exportSettings,
          getDownloadFormatFromBlob(finalBlob),
        );

        downloadBlob(finalBlob, filename);

        onProgress({
          status: "done",
          progress: 100,
          message: `Downloaded silent video (${filename}) — background music mix failed`,
          warning: musicWarning,
        });
        return;
      }
    }
  }

  const exportHasAudio = audioMixed && (includeNarration || Boolean(backgroundMusicBlob));

  if (exportSettings.format === "mp4") {
    onProgress({
      status: "finalizing",
      progress: 90,
      message: "Converting to MP4 (0%)",
    });

    const { transcodeWebmToMp4 } = await import("@/features/export/utils/ffmpeg.utils");
    finalBlob = await transcodeWebmToMp4(finalBlob, {
      hasAudio: exportHasAudio,
      onProgress: (transcodePercent) => {
        onProgress({
          status: "finalizing",
          progress: 90 + Math.round(transcodePercent * 0.1),
          message: `Converting to MP4 (${transcodePercent}%)`,
        });
      },
    });
  }

  const filename = buildExportDownloadFileName(
    exportSettings,
    getDownloadFormatFromBlob(finalBlob),
  );

  downloadBlob(finalBlob, filename);

  const combinedWarning = [formatWarning, musicWarning].filter(Boolean).join(" ") || undefined;

  onProgress({
    status: "done",
    progress: 100,
    message: exportHasAudio
      ? `Download ready — ${filename}`
      : `Download ready — ${filename} (${quality.width}×${quality.height})`,
    warning: combinedWarning,
  });
}
