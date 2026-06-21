"use client";

import { useEffect, useState } from "react";

import { normalizeCaptionMode, normalizeSubtitleEffect } from "@/features/story/utils";
import {
  getDisplayCaptionLines,
  SUBTITLE_MAX_VISIBLE_LINES,
  wrapSubtitleTextToDisplayLines,
  type DisplayCaptionScene,
} from "@/features/story/utils";
import type { SubtitleEffect } from "@/features/story/types";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function TypewriterIntervalReveal({ text }: { text: string }) {
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    const stepMs = Math.max(28, Math.min(48, Math.floor(2000 / Math.max(text.length, 1))));
    let count = 0;

    const timer = window.setInterval(() => {
      count += 1;
      setVisibleLength(count);
      if (count >= text.length) {
        window.clearInterval(timer);
      }
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [text]);

  const revealed = text.slice(0, visibleLength);
  const isComplete = revealed.length >= text.length;

  return (
    <p className={isComplete ? undefined : "subtitle-effect-typewriter-caret"}>{revealed}</p>
  );
}

function TypewriterProgressReveal({ text, progress }: { text: string; progress: number }) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const visibleLength =
    clampedProgress >= 1 ? text.length : Math.floor(text.length * clampedProgress);
  const revealed = text.slice(0, visibleLength);
  const showCaret = clampedProgress < 1 && visibleLength < text.length;

  return (
    <p className={showCaret ? "subtitle-effect-typewriter-caret" : undefined}>{revealed}</p>
  );
}

function TypewriterSubtitleCaptionInner({
  text,
  progress,
}: {
  text: string;
  progress?: number;
}) {
  const reducedMotion = usePrefersReducedMotion();

  if (!text) {
    return null;
  }

  if (reducedMotion) {
    return <p>{text}</p>;
  }

  if (progress !== undefined) {
    return <TypewriterProgressReveal text={text} progress={progress} />;
  }

  return <TypewriterIntervalReveal key={text} text={text} />;
}

function CaptionLines({
  lines,
  className,
  lineClassName,
}: {
  lines: string[];
  className: string;
  lineClassName?: string;
}) {
  return (
    <div className={className}>
      {lines.map((line, index) => (
        <p key={index} className={index > 0 ? `mt-0.5 ${lineClassName ?? ""}` : lineClassName}>
          {line}
        </p>
      ))}
    </div>
  );
}

function FadeUpSubtitleCaption({
  lines,
  className,
  chunkKey,
}: {
  lines: string[];
  className: string;
  chunkKey: string;
}) {
  return (
    <div className={className}>
      <div key={chunkKey} className="subtitle-effect-fade-up">
        {lines.map((line, index) => (
          <p key={index} className={index > 0 ? "mt-0.5" : undefined}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function TypewriterSubtitleCaption({
  text,
  className,
  chunkKey,
  progress,
}: {
  text: string;
  className: string;
  chunkKey: string;
  progress?: number;
}) {
  return (
    <div className={`${className} subtitle-effect-typewriter`}>
      <TypewriterSubtitleCaptionInner key={chunkKey} text={text} progress={progress} />
    </div>
  );
}

function HighlightSubtitleCaption({
  lines,
  className,
  chunkKey,
}: {
  lines: string[];
  className: string;
  chunkKey: string;
}) {
  return (
    <div key={chunkKey} className={`${className} subtitle-effect-highlight`}>
      {lines.map((line, index) => (
        <p key={index} className={`flex justify-center ${index > 0 ? "mt-1.5" : ""}`}>
          <span className="subtitle-effect-highlight-line">
            <span className="subtitle-effect-highlight-bar" aria-hidden />
            <span className="subtitle-effect-highlight-text">{line}</span>
          </span>
        </p>
      ))}
    </div>
  );
}

function SubtitleEffectCaption({
  scene,
  activeChunk,
  lines,
  className,
  chunkKey,
  chunkProgress,
}: {
  scene: DisplayCaptionScene & { id?: string };
  activeChunk: string;
  lines: string[];
  className: string;
  chunkKey: string;
  chunkProgress?: number;
}) {
  const effect: SubtitleEffect = normalizeSubtitleEffect(scene.subtitleEffect);
  const displayText = activeChunk || lines.join(" ").trim();

  switch (effect) {
    case "typewriter":
      return (
        <TypewriterSubtitleCaption
          text={displayText}
          className={className}
          chunkKey={chunkKey}
          progress={chunkProgress}
        />
      );
    case "highlight":
      return (
        <HighlightSubtitleCaption lines={lines} className={className} chunkKey={chunkKey} />
      );
    case "fade-up":
    default:
      return (
        <FadeUpSubtitleCaption lines={lines} className={className} chunkKey={chunkKey} />
      );
  }
}

export interface RenderSceneCaptionOptions {
  /** Caps visible lines (used for preview narration subtitles). */
  maxLines?: number;
  /** Active subtitle chunk (subtitles mode). */
  activeSubtitleChunk?: string;
  /** Progress through the active chunk time window (0–1), preview only. */
  chunkProgress?: number;
}

export function renderSceneCaptionContent(
  scene: DisplayCaptionScene & { id?: string },
  className: string,
  animationSeed = "",
  options: RenderSceneCaptionOptions = {},
) {
  const isSubtitlesMode = normalizeCaptionMode(scene.captionMode) === "subtitles";
  const activeChunk =
    isSubtitlesMode && options.activeSubtitleChunk !== undefined
      ? options.activeSubtitleChunk
      : isSubtitlesMode
        ? getDisplayCaptionLines(scene).join(" ").trim()
        : "";

  const lineCap = options.maxLines ?? SUBTITLE_MAX_VISIBLE_LINES;
  const allLines =
    isSubtitlesMode && activeChunk
      ? wrapSubtitleTextToDisplayLines(activeChunk, { maxLines: lineCap })
      : getDisplayCaptionLines(scene);
  const lines = allLines.slice(0, lineCap);

  if (lines.length === 0) {
    return null;
  }

  const chunkKey =
    scene.id && activeChunk
      ? `${scene.id}-${activeChunk}`
      : `${animationSeed}-${activeChunk}-${normalizeSubtitleEffect(scene.subtitleEffect)}`;

  if (!isSubtitlesMode) {
    return <CaptionLines lines={lines} className={className} />;
  }

  return (
    <SubtitleEffectCaption
      scene={scene}
      activeChunk={activeChunk}
      lines={lines}
      className={className}
      chunkKey={chunkKey}
      chunkProgress={options.chunkProgress}
    />
  );
}
