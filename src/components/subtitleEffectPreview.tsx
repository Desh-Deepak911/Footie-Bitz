"use client";

import { useEffect, useState } from "react";

import { normalizeCaptionMode, normalizeSubtitleEffect } from "@/lib/captionMode";
import {
  getDisplayCaption,
  getDisplayCaptionLines,
  type DisplayCaptionScene,
} from "@/lib/displayCaption";
import type { SubtitleEffect } from "@/types/footiebitz";

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

function TypewriterSubtitleCaptionInner({ text }: { text: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    if (reducedMotion || !text) {
      return;
    }

    const stepMs = Math.max(28, Math.min(48, Math.floor(2000 / text.length)));
    let count = 0;

    const timer = window.setInterval(() => {
      count += 1;
      setVisibleLength(count);
      if (count >= text.length) {
        window.clearInterval(timer);
      }
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [reducedMotion, text]);

  const revealed = reducedMotion ? text : text.slice(0, visibleLength);
  const isComplete = revealed.length >= text.length;

  return (
    <p className={isComplete ? undefined : "subtitle-effect-typewriter-caret"}>{revealed}</p>
  );
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
  animationKey,
}: {
  lines: string[];
  className: string;
  animationKey: string;
}) {
  return (
    <div key={animationKey} className={`${className} subtitle-effect-fade-up`}>
      {lines.map((line, index) => (
        <p key={index} className={index > 0 ? "mt-0.5" : undefined}>
          {line}
        </p>
      ))}
    </div>
  );
}

function TypewriterSubtitleCaption({
  text,
  className,
  animationKey,
}: {
  text: string;
  className: string;
  animationKey: string;
}) {
  return (
    <div className={className}>
      <TypewriterSubtitleCaptionInner key={animationKey} text={text} />
    </div>
  );
}

function HighlightSubtitleCaption({
  lines,
  className,
  animationKey,
}: {
  lines: string[];
  className: string;
  animationKey: string;
}) {
  return (
    <div key={animationKey} className={className}>
      {lines.map((line, index) => (
        <p key={index} className={index > 0 ? "mt-1" : undefined}>
          <span className="subtitle-effect-highlight-inner">{line}</span>
        </p>
      ))}
    </div>
  );
}

function SubtitleEffectCaption({
  scene,
  lines,
  className,
  animationKey,
}: {
  scene: DisplayCaptionScene;
  lines: string[];
  className: string;
  animationKey: string;
}) {
  const effect: SubtitleEffect = normalizeSubtitleEffect(scene.subtitleEffect);
  const fullText = getDisplayCaption(scene);

  switch (effect) {
    case "typewriter":
      return (
        <TypewriterSubtitleCaption
          text={fullText}
          className={className}
          animationKey={animationKey}
        />
      );
    case "highlight":
      return (
        <HighlightSubtitleCaption
          lines={lines}
          className={className}
          animationKey={animationKey}
        />
      );
    case "fade-up":
    default:
      return (
        <FadeUpSubtitleCaption
          lines={lines}
          className={className}
          animationKey={animationKey}
        />
      );
  }
}

export function renderSceneCaptionContent(
  scene: DisplayCaptionScene,
  className: string,
  animationSeed = "",
) {
  const lines = getDisplayCaptionLines(scene);
  if (lines.length === 0) {
    return null;
  }

  const isSubtitlesMode = normalizeCaptionMode(scene.captionMode) === "subtitles";
  const animationKey = `${animationSeed}-${getDisplayCaption(scene)}-${normalizeSubtitleEffect(scene.subtitleEffect)}`;

  if (!isSubtitlesMode) {
    return <CaptionLines lines={lines} className={className} />;
  }

  return (
    <SubtitleEffectCaption
      scene={scene}
      lines={lines}
      className={className}
      animationKey={animationKey}
    />
  );
}
