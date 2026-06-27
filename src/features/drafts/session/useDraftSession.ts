"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import type { FootieScript } from "@/features/story/types";

import { useIsClientMounted } from "../hooks/useIsClientMounted";
import type { Draft, DraftPipelineStage, StoryCreationBrief } from "../types";

import {
  ensureDraftSession,
  flushDraftSessionPersist,
  getDraftSessionSnapshot,
  persistDraftSessionCreationBrief,
  scheduleDraftSessionPersist,
  seedDraftSession,
  subscribeDraftSessionStore,
  updateDraftSessionMeta,
  updateDraftSessionScript,
} from "./draft-session-store";
import type { DraftSessionRecord } from "./draft-session.types";

export type UseDraftSessionResult = {
  isLoading: boolean;
  isNotFound: boolean;
  session: DraftSessionRecord;
  draft: Draft | null;
  script: FootieScript | null;
  updateScript: (
    updater: FootieScript | ((current: FootieScript) => FootieScript),
  ) => void;
  setPipelineStage: (stage: DraftPipelineStage) => void;
  setCreationBrief: (brief: StoryCreationBrief) => void;
  schedulePersist: (stage?: DraftPipelineStage) => void;
  flushPersist: (
    stage?: DraftPipelineStage,
    scriptOverride?: FootieScript,
  ) => Promise<Draft | null>;
  seedSession: (draft: Draft) => void;
};

export function useDraftSession(draftId: string): UseDraftSessionResult {
  const isClient = useIsClientMounted();

  useEffect(() => {
    if (!isClient) {
      return;
    }

    ensureDraftSession(draftId);
  }, [draftId, isClient]);

  const session = useSyncExternalStore(
    subscribeDraftSessionStore,
    () => getDraftSessionSnapshot(draftId),
    () => getDraftSessionSnapshot(draftId),
  );

  const updateScript = useCallback(
    (updater: FootieScript | ((current: FootieScript) => FootieScript)) => {
      updateDraftSessionScript(draftId, updater);
    },
    [draftId],
  );

  const setPipelineStage = useCallback(
    (stage: DraftPipelineStage) => {
      updateDraftSessionMeta(draftId, { pipelineStage: stage });
    },
    [draftId],
  );

  const setCreationBrief = useCallback(
    (brief: StoryCreationBrief) => {
      updateDraftSessionMeta(draftId, { creationBrief: brief });
      persistDraftSessionCreationBrief(draftId, brief);
    },
    [draftId],
  );

  const schedulePersist = useCallback(
    (stage?: DraftPipelineStage) => {
      scheduleDraftSessionPersist(draftId, stage);
    },
    [draftId],
  );

  const flushPersist = useCallback(
    (stage?: DraftPipelineStage, scriptOverride?: FootieScript) =>
      flushDraftSessionPersist(draftId, stage, scriptOverride),
    [draftId],
  );

  const seedSession = useCallback((draft: Draft) => {
    seedDraftSession(draft);
  }, []);

  const isLoading =
    !isClient || session.loadStatus === "idle" || session.loadStatus === "loading";
  const isNotFound = session.loadStatus === "not_found";

  return {
    isLoading,
    isNotFound,
    session,
    draft: session.draft,
    script: session.script,
    updateScript,
    setPipelineStage,
    setCreationBrief,
    schedulePersist,
    flushPersist,
    seedSession,
  };
}
