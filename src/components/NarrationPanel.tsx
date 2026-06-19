"use client";

import { ChevronDown, Loader2, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { revokeBlobUrl } from "@/lib/blobUrl";
import {
  studioInput,
  studioSectionDesc,
  studioSectionTitle,
  studioStepLabel,
} from "@/lib/studioUi";
import { syncFootieScript } from "@/lib/voiceover";
import {
  VOICEOVER_VOICE_OPTIONS,
  type VoiceoverVoiceOption,
} from "@/lib/voiceoverOptions";
import type { FootieScript } from "@/types/footiebitz";

interface NarrationPanelProps {
  script: FootieScript;
  onScriptChange: (script: FootieScript) => void;
  disabled?: boolean;
}

export default function NarrationPanel({
  script,
  onScriptChange,
  disabled = false,
}: NarrationPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState<VoiceoverVoiceOption>("alloy");
  const managedVoiceoverUrl = useRef<string | null>(null);

  const narrationText = script.narration.trim();

  useEffect(() => {
    const managedUrl = managedVoiceoverUrl.current;
    return () => {
      revokeBlobUrl(managedUrl);
      managedVoiceoverUrl.current = null;
    };
  }, []);

  useEffect(() => {
    if (!script.voiceoverUrl) {
      revokeBlobUrl(managedVoiceoverUrl.current);
      managedVoiceoverUrl.current = null;
    }
  }, [script.voiceoverUrl]);

  const revokeManagedVoiceoverUrl = () => {
    revokeBlobUrl(managedVoiceoverUrl.current);
    managedVoiceoverUrl.current = null;
  };

  const handleCreateNarration = async () => {
    setError(null);

    if (!narrationText) {
      setError("Add narration to your story before creating audio.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate-voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: narrationText, voice }),
      });

      if (!response.ok) {
        let message = "Failed to create narration";
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // Non-JSON error body
        }
        throw new Error(message);
      }

      const contentType = response.headers.get("Content-Type") ?? "";
      if (!contentType.includes("audio")) {
        throw new Error("Narration returned an unexpected response format");
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Narration audio is empty");
      }

      const audioBlob = blob.type.includes("audio")
        ? blob
        : new Blob([await blob.arrayBuffer()], { type: "audio/mpeg" });

      if (
        script.voiceoverUrl &&
        script.voiceoverUrl !== managedVoiceoverUrl.current
      ) {
        revokeBlobUrl(script.voiceoverUrl);
      }
      revokeManagedVoiceoverUrl();
      const voiceoverUrl = URL.createObjectURL(audioBlob);
      managedVoiceoverUrl.current = voiceoverUrl;

      onScriptChange(
        syncFootieScript({
          ...script,
          voiceoverUrl,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create narration");
    } finally {
      setLoading(false);
    }
  };

  const isBusy = loading || disabled;

  return (
    <div className="space-y-7">
      <div>
        <p className={studioStepLabel}>Step 4</p>
        <h2 className={studioSectionTitle}>Narration</h2>
        <p className={studioSectionDesc}>
          Turn your story narration into spoken audio for preview and export.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-4 py-3.5">
        <p className="text-xs leading-relaxed text-zinc-500">
          FootieBitz will read the full narration while scenes change in sequence.
        </p>
      </div>

      <div>
        <label htmlFor="narration-voice" className="mb-2 block text-sm font-medium text-zinc-300">
          Narrator voice
        </label>
        <div className="relative max-w-xs">
          <select
            id="narration-voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value as VoiceoverVoiceOption)}
            disabled={isBusy}
            className={`${studioInput} appearance-none pr-10 capitalize`}
          >
            {VOICEOVER_VOICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCreateNarration}
        disabled={isBusy || !narrationText}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-900/60 bg-violet-950/40 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-800 hover:bg-violet-950/60 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating narration...
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" strokeWidth={1.75} />
            {script.voiceoverUrl ? "Recreate Narration" : "Create Narration"}
          </>
        )}
      </button>

      {script.voiceoverUrl && (
        <div className="rounded-xl border border-violet-900/40 bg-violet-950/20 p-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-violet-400/80">
            Audio preview
          </p>
          <audio controls src={script.voiceoverUrl} className="w-full" preload="metadata">
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3">
          <p className="text-xs leading-relaxed text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
