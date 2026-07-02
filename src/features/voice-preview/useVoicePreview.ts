"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchVoicePreview } from "./voice-preview.client";
import {
  getActiveVoicePreviewVoiceId,
  startVoicePreview,
  stopVoicePreview,
  subscribeVoicePreviewPlayback,
} from "./voice-preview.playback";
import type { VoicePreviewState } from "./voice-preview.types";

export interface UseVoicePreviewOptions {
  voiceId: string;
  speed?: number;
  stylePreset?: string;
  expressiveDelivery?: boolean;
  disabled?: boolean;
}

export function useVoicePreview({
  voiceId,
  speed,
  stylePreset,
  expressiveDelivery,
  disabled = false,
}: UseVoicePreviewOptions) {
  const [state, setState] = useState<VoicePreviewState>("idle");
  const [error, setError] = useState<string | null>(null);
  const previewGenerationRef = useRef(0);

  useEffect(() => {
    return subscribeVoicePreviewPlayback((activeVoiceId) => {
      if (activeVoiceId === voiceId) {
        setState((current) => (current === "loading" ? "playing" : current));
        return;
      }

      setState((current) => (current === "playing" ? "idle" : current));
      setError(null);
    });
  }, [voiceId]);

  const handlePreview = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();

      if (disabled) {
        return;
      }

      if (state === "playing" && getActiveVoicePreviewVoiceId() === voiceId) {
        stopVoicePreview();
        setState("idle");
        setError(null);
        return;
      }

      const generation = previewGenerationRef.current + 1;
      previewGenerationRef.current = generation;

      try {
        setState("loading");
        setError(null);
        stopVoicePreview();

        const blob = await fetchVoicePreview({
          voice: voiceId,
          speed,
          stylePreset,
          expressiveDelivery,
        });

        if (previewGenerationRef.current !== generation) {
          return;
        }

        await startVoicePreview(voiceId, blob, {
          onEnded: () => {
            if (previewGenerationRef.current !== generation) {
              return;
            }
            setState("idle");
            setError(null);
          },
          onError: () => {
            if (previewGenerationRef.current !== generation) {
              return;
            }
            setState("error");
            setError("Couldn't play preview");
          },
        });

        if (previewGenerationRef.current !== generation) {
          return;
        }

        setState("playing");
      } catch (previewError) {
        if (previewGenerationRef.current !== generation) {
          return;
        }
        setState("error");
        setError(
          previewError instanceof Error ? previewError.message : "Preview failed",
        );
      }
    },
    [disabled, expressiveDelivery, speed, state, stylePreset, voiceId],
  );

  return {
    state,
    error,
    handlePreview,
  };
}
