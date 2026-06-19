"use client";

import {
  AudioLines,
  Clapperboard,
  FileVideo,
  Scissors,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { studioCard, studioSecondaryButton, studioStepLabel } from "@/lib/studioUi";

const COMING_SOON_MESSAGE =
  "Coming soon: FootieBitz will extract audio, detect key moments, and create multiple shorts from one upload.";

const PIPELINE_STEPS = [
  { step: "1", title: "Upload video", icon: Upload },
  { step: "2", title: "Extract audio", icon: AudioLines },
  { step: "3", title: "Transcribe", icon: FileVideo },
  { step: "4", title: "Detect best moments", icon: Wand2 },
  { step: "5", title: "Create short stories", icon: Sparkles },
  { step: "6", title: "Export multiple clips", icon: Clapperboard },
] as const;

export default function BreakLongVideoSection() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [analyzeMessage, setAnalyzeMessage] = useState<string | null>(null);
  const managedBlobUrl = useRef<string | null>(null);

  const revokeVideoUrl = () => {
    if (managedBlobUrl.current) {
      URL.revokeObjectURL(managedBlobUrl.current);
      managedBlobUrl.current = null;
    }
  };

  const handleVideoUpload = (file: File | null) => {
    revokeVideoUrl();
    setAnalyzeMessage(null);

    if (!file) {
      setVideoUrl(null);
      setVideoName(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    managedBlobUrl.current = objectUrl;
    setVideoUrl(objectUrl);
    setVideoName(file.name);
  };

  useEffect(() => {
    return () => revokeVideoUrl();
  }, []);

  return (
    <section className={studioCard}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80">
            <Scissors className="h-4.5 w-4.5 text-zinc-500" strokeWidth={1.75} />
          </div>
          <div>
            <p className={studioStepLabel}>Coming soon</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-50">
              Break Long Video into Shorts
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              Upload a full match or podcast clip and turn highlights into multiple vertical
              shorts.
            </p>
          </div>
        </div>
        <span className="self-start rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Preview
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
              Source video
            </p>

            {videoUrl ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
                  <video
                    src={videoUrl}
                    controls
                    className="aspect-video w-full bg-black object-contain"
                  >
                    Your browser does not support video preview.
                  </video>
                </div>
                {videoName && (
                  <p className="truncate text-xs text-zinc-600">{videoName}</p>
                )}
                <label className={`${studioSecondaryButton} cursor-pointer`}>
                  <Upload className="h-4 w-4" />
                  Replace video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      handleVideoUpload(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            ) : (
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950/30 px-6 py-12 text-center transition hover:border-zinc-600 hover:bg-zinc-900/40">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 transition group-hover:border-zinc-700">
                  <Upload className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-300">Upload a video file</p>
                <p className="mt-1.5 text-xs text-zinc-600">MP4, MOV, or WEBM · processed in your browser</p>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    handleVideoUpload(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <button
            type="button"
            onClick={() => setAnalyzeMessage(COMING_SOON_MESSAGE)}
            disabled={!videoUrl}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Wand2 className="h-4 w-4" strokeWidth={1.75} />
            Analyze Video
          </button>

          {analyzeMessage && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3.5">
              <p className="text-sm leading-relaxed text-zinc-400">{analyzeMessage}</p>
            </div>
          )}
        </div>

        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
            Future pipeline
          </p>
          <ol className="space-y-2">
            {PIPELINE_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.step}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs font-medium text-zinc-500">
                    {item.step}
                  </span>
                  <Icon className="h-4 w-4 shrink-0 text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-400">{item.title}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-[11px] leading-relaxed text-zinc-600">
            Video analysis will run client-side or via dedicated APIs in a future release.
          </p>
        </div>
      </div>
    </section>
  );
}
