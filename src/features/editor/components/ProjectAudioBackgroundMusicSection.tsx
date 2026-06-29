"use client";

import { Music, Trash2, Upload } from "lucide-react";
import { useId, useRef } from "react";

import {
  applyStoryBackgroundMusic,
  BACKGROUND_MUSIC_LIBRARY_TRACKS,
  formatBackgroundMusicLibraryLicenseLabel,
  getStoryBackgroundMusic,
  percentToVolume,
  volumeToPercent,
} from "@/features/story/utils";
import type { BackgroundMusicSource, FootieScript, StoryBackgroundMusic } from "@/features/story/types";
import { revokeBlobUrl } from "@/lib/utils/blobUrl";
import {
  studioBadge,
  studioChip,
  studioChipActive,
  studioCompactButton,
  studioFieldLabel,
  studioRange,
  studioRangeTouchHost,
  studioSegment,
  studioSegmentActive,
  studioSegmentedControl,
  studioSubtleText,
} from "@/lib/utils/studioUi";

export interface ProjectAudioBackgroundMusicSectionProps {
  script: FootieScript;
  onScriptChange: (script: FootieScript) => void;
  disabled?: boolean;
}

const ACCEPTED_AUDIO_TYPES =
  "audio/*,.mp3,.wav,.m4a,.aac,.ogg,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg";

const SOURCE_OPTIONS: { value: BackgroundMusicSource; label: string }[] = [
  { value: "none", label: "None" },
  { value: "upload", label: "Upload music" },
  { value: "library", label: "Library" },
];

function resolveMusicSelectionLabel(music: StoryBackgroundMusic): string {
  if (!music.enabled || music.source === "none") {
    return "None selected";
  }

  if (music.source === "upload") {
    return music.fileName?.trim() || "Uploaded track";
  }

  if (music.source === "library") {
    return music.trackName?.trim() || "Library track";
  }

  return "None selected";
}

function hasActiveMusic(music: StoryBackgroundMusic): boolean {
  return music.enabled && music.source !== "none";
}

function CompactToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 py-1 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-[11px] font-medium text-foreground/90">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[10px] leading-relaxed text-muted">{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 shrink-0 accent-accent"
      />
    </label>
  );
}

/**
 * Flat background music surface for Project Audio Studio — source, upload, library, volume, and fades.
 */
export default function ProjectAudioBackgroundMusicSection({
  script,
  onScriptChange,
  disabled = false,
}: ProjectAudioBackgroundMusicSectionProps) {
  const uploadInputId = useId();
  const volumeInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundMusic = getStoryBackgroundMusic(script);
  const activeSource = backgroundMusic.enabled ? backgroundMusic.source : "none";
  const controlsDisabled = disabled;
  const settingsDisabled = controlsDisabled || activeSource === "none";
  const volumePercent = volumeToPercent(backgroundMusic.volume);
  const hasLibraryTracks = BACKGROUND_MUSIC_LIBRARY_TRACKS.length > 0;
  const selectionLabel = resolveMusicSelectionLabel(backgroundMusic);
  const musicIsActive = hasActiveMusic(backgroundMusic);

  const updateBackgroundMusic = (patch: Parameters<typeof applyStoryBackgroundMusic>[1]) => {
    onScriptChange(applyStoryBackgroundMusic(script, patch));
  };

  const removeMusic = () => {
    revokeBlobUrl(backgroundMusic.fileUrl);
    updateBackgroundMusic({
      enabled: false,
      source: "none",
      fileUrl: undefined,
      fileName: undefined,
      trackId: undefined,
      trackName: undefined,
      artist: undefined,
      license: undefined,
      attributionRequired: undefined,
      attributionText: undefined,
    });
  };

  const handleSourceChange = (source: BackgroundMusicSource) => {
    if (source === "none") {
      removeMusic();
      return;
    }

    if (source === "upload") {
      updateBackgroundMusic({
        enabled: true,
        source: "upload",
        trackId: undefined,
        trackName: undefined,
        artist: undefined,
        license: undefined,
        attributionRequired: undefined,
        attributionText: undefined,
      });
      return;
    }

    if (!hasLibraryTracks) {
      return;
    }

    revokeBlobUrl(backgroundMusic.fileUrl);
    updateBackgroundMusic({
      enabled: true,
      source: "library",
      fileUrl: undefined,
      fileName: undefined,
    });
  };

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    revokeBlobUrl(backgroundMusic.fileUrl);
    const fileUrl = URL.createObjectURL(file);

    updateBackgroundMusic({
      enabled: true,
      source: "upload",
      fileUrl,
      fileName: file.name,
      trackId: undefined,
      trackName: undefined,
      artist: undefined,
      license: undefined,
      attributionRequired: undefined,
      attributionText: undefined,
    });
  };

  const handleLibrarySelect = (trackId: string) => {
    const track = BACKGROUND_MUSIC_LIBRARY_TRACKS.find((item) => item.id === trackId);
    if (!track) {
      return;
    }

    revokeBlobUrl(backgroundMusic.fileUrl);
    updateBackgroundMusic({
      enabled: true,
      source: "library",
      fileUrl: track.fileUrl,
      fileName: undefined,
      trackId: track.id,
      trackName: track.name,
      artist: track.artist,
      license: track.license,
      attributionRequired: track.attributionRequired,
      attributionText: track.attributionText,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className={studioFieldLabel}>Selected</p>
        <span
          className={`${studioBadge} shrink-0 ${musicIsActive ? "text-accent ring-accent/25" : "text-muted ring-border/25"}`}
        >
          <Music className="h-3 w-3" aria-hidden />
          {selectionLabel}
        </span>
      </div>

      <div
        className={studioSegmentedControl}
        role="tablist"
        aria-label="Background music source"
      >
        {SOURCE_OPTIONS.map((option) => {
          const active = activeSource === option.value;
          const isLibraryOption = option.value === "library";
          const optionDisabled =
            controlsDisabled || (isLibraryOption && !hasLibraryTracks);

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={optionDisabled}
              title={isLibraryOption && !hasLibraryTracks ? "Coming soon" : undefined}
              onClick={() => handleSourceChange(option.value)}
              className={active ? studioSegmentActive : studioSegment}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {!hasLibraryTracks ? (
        <p className={`${studioSubtleText} text-[11px] leading-relaxed`}>
          Music library coming soon. Upload your own licensed track below.
        </p>
      ) : null}

      {activeSource === "upload" ? (
        <div className="space-y-1.5 border-t border-border/15 pt-3">
          <input
            ref={fileInputRef}
            id={uploadInputId}
            type="file"
            accept={ACCEPTED_AUDIO_TYPES}
            className="sr-only"
            disabled={controlsDisabled}
            onChange={handleUploadChange}
          />
          <button
            type="button"
            disabled={controlsDisabled}
            onClick={() => fileInputRef.current?.click()}
            className={`${studioCompactButton} w-full justify-center`}
          >
            <Upload className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Upload music
          </button>
          <p className={`${studioSubtleText} truncate text-center text-[11px]`}>
            {backgroundMusic.fileName ?? "No file selected yet"}
          </p>
        </div>
      ) : null}

      {activeSource === "library" && hasLibraryTracks ? (
        <div className="space-y-1.5 border-t border-border/15 pt-3">
          <p className={studioFieldLabel}>Choose from library</p>
          <div className="space-y-1">
            {BACKGROUND_MUSIC_LIBRARY_TRACKS.map((track) => {
              const active = backgroundMusic.trackId === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  disabled={controlsDisabled}
                  onClick={() => handleLibrarySelect(track.id)}
                  className={`${active ? studioChipActive : studioChip} w-full justify-start px-2.5 py-2 text-left`}
                >
                  <span className="block truncate text-xs font-medium text-foreground/90">
                    {track.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted">
                    {track.artist} · {track.mood}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted/80">
                    {formatBackgroundMusicLibraryLicenseLabel(track)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div
        className={`space-y-2 border-t border-border/15 pt-3 ${settingsDisabled ? "opacity-50" : ""}`}
      >
        <section aria-label="Background music volume">
          <div className="mb-1 flex items-center justify-between gap-3">
            <label htmlFor={volumeInputId} className={studioFieldLabel}>
              Volume
            </label>
            <span className="text-[11px] font-medium tabular-nums text-muted">{volumePercent}%</span>
          </div>
          <div className={studioRangeTouchHost}>
            <input
              id={volumeInputId}
              type="range"
              min={0}
              max={100}
              step={1}
              value={volumePercent}
              disabled={settingsDisabled}
              onChange={(event) =>
                updateBackgroundMusic({ volume: percentToVolume(Number(event.target.value)) })
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volumePercent}
              className={studioRange}
            />
          </div>
        </section>

        <CompactToggleRow
          label="Fade in"
          checked={backgroundMusic.fadeIn}
          disabled={settingsDisabled}
          onChange={(fadeIn) => updateBackgroundMusic({ fadeIn })}
        />
        <CompactToggleRow
          label="Fade out"
          checked={backgroundMusic.fadeOut}
          disabled={settingsDisabled}
          onChange={(fadeOut) => updateBackgroundMusic({ fadeOut })}
        />
        <CompactToggleRow
          label="Duck under voiceover"
          description="Lowers music while narration plays"
          checked={backgroundMusic.duckingEnabled}
          disabled={settingsDisabled}
          onChange={(duckingEnabled) => updateBackgroundMusic({ duckingEnabled })}
        />
      </div>

      {musicIsActive ? (
        <button
          type="button"
          disabled={controlsDisabled}
          onClick={removeMusic}
          className={`${studioCompactButton} w-full justify-center text-rose-200/90 hover:text-rose-100`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove music
        </button>
      ) : null}

      <p className={`${studioSubtleText} text-[11px] leading-relaxed`}>
        Background music is saved with your story. Voiceover status is not affected.
      </p>
    </div>
  );
}
