"use client";

import { useMemo } from "react";

import {
  buildAudioMixFromStory,
  getVoiceoverAvailability,
  resolveExportAudioSource,
} from "@/features/audio";
import { getStoryBackgroundMusic } from "@/features/story/utils";
import type { FootieScript } from "@/features/story/types";
import { studioFieldLabel, studioPanel, studioSubtleText } from "@/lib/utils/studioUi";

export interface ProjectAudioExportMixSummaryProps {
  script: FootieScript;
  /** Flat layout inside ProjectAudioStudio — omits outer panel chrome. */
  embedded?: boolean;
}

function formatExportMixLabel(source: ReturnType<typeof resolveExportAudioSource>): string {
  switch (source) {
    case "voiceover+background":
      return "Voiceover + background music";
    case "voiceover":
      return "Voiceover only";
    case "background":
      return "Background music only";
    default:
      return "No audio tracks";
  }
}

function resolveVoiceoverExportLabel(
  availability: ReturnType<typeof getVoiceoverAvailability>,
  hasVoiceoverInMix: boolean,
): string {
  if (hasVoiceoverInMix) {
    return "Included";
  }

  if (availability.hasCanonicalVoiceover) {
    return "Missing — audio cannot load";
  }

  return "Missing";
}

function resolveMusicExportLabel(
  music: ReturnType<typeof getStoryBackgroundMusic>,
  hasMusicInMix: boolean,
): string {
  if (!hasMusicInMix) {
    return "None";
  }

  if (music.source === "library") {
    return `Included — ${music.trackName ?? "Library track"}`;
  }

  if (music.source === "upload") {
    return `Included — ${music.fileName ?? "Uploaded track"}`;
  }

  return "Included";
}

/**
 * Read-only export mix summary — mirrors buildAudioMixFromStory / resolveExportAudioSource.
 */
export default function ProjectAudioExportMixSummary({
  script,
  embedded = false,
}: ProjectAudioExportMixSummaryProps) {
  const mix = useMemo(() => buildAudioMixFromStory(script), [script]);
  const availability = useMemo(() => getVoiceoverAvailability(script), [script]);
  const music = getStoryBackgroundMusic(script);
  const exportSource = resolveExportAudioSource(mix);
  const hasVoiceoverInMix = Boolean(mix.voiceover?.src);
  const hasMusicInMix = Boolean(mix.background?.src && mix.background.enabled);
  const voiceoverDetail = resolveVoiceoverExportLabel(availability, hasVoiceoverInMix);
  const musicDetail = resolveMusicExportLabel(music, hasMusicInMix);

  return (
    <div className={embedded ? "space-y-2.5" : `${studioPanel} space-y-3`}>
      <p className={`${studioSubtleText} text-[11px] leading-relaxed`}>
        Summary of what the export pipeline will mux with your video. Use canvas Play to preview
        the full mix.
      </p>

      <dl className="space-y-2 text-[11px]">
        <div className="flex items-center justify-between gap-3">
          <dt className={studioFieldLabel}>Export mix</dt>
          <dd className="text-foreground/90">{formatExportMixLabel(exportSource)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className={studioFieldLabel}>Voiceover</dt>
          <dd className="text-right text-foreground/90">{voiceoverDetail}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className={studioFieldLabel}>Background music</dt>
          <dd className="text-right text-foreground/90">{musicDetail}</dd>
        </div>
      </dl>
    </div>
  );
}
