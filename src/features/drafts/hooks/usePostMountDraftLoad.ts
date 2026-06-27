"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { FootieScript } from "@/features/story/types";

import { getDraft } from "../services";
import type { Draft } from "../types";
import { resolveDraftScriptForEditor } from "../utils";

import { useIsClientMounted } from "./useIsClientMounted";

export type PostMountDraftLoadStatus =
  | "idle"
  | "pending"
  | "loaded"
  | "not_found"
  | "redirecting";

export type DraftRedirectResolver = (draft: Draft) => string | null;

export type DraftLoadedHandler = (draft: Draft, script: FootieScript) => void;

/**
 * Loads a draft from localStorage after client mount — never during SSR or render.
 */
export function usePostMountDraftLoad(
  draftId: string,
  resolveRedirect?: DraftRedirectResolver,
  onLoaded?: DraftLoadedHandler,
) {
  const router = useRouter();
  const isClient = useIsClientMounted();
  const [status, setStatus] = useState<PostMountDraftLoadStatus>("idle");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [script, setScript] = useState<FootieScript | null>(null);

  const loadDraft = useCallback(() => {
    setStatus("pending");
    setDraft(null);
    setScript(null);

    const stored = getDraft(draftId);
    if (!stored) {
      setStatus("not_found");
      return;
    }

    const redirectTo = resolveRedirect?.(stored) ?? null;
    if (redirectTo) {
      setStatus("redirecting");
      router.replace(redirectTo);
      return;
    }

    const hydratedScript = resolveDraftScriptForEditor(stored);
    setDraft(stored);
    setScript(hydratedScript);
    setStatus("loaded");
    onLoaded?.(stored, hydratedScript);
  }, [draftId, onLoaded, resolveRedirect, router]);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      loadDraft();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isClient, loadDraft]);

  const isLoading =
    !isClient ||
    status === "idle" ||
    status === "pending" ||
    status === "redirecting";

  return {
    isClient,
    isLoading,
    status,
    draft,
    script,
    setDraft,
    setScript,
    reloadDraft: loadDraft,
  };
}
