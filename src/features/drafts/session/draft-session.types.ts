import type { FootieScript } from "@/features/story/types";

import type { Draft } from "../types";

export type DraftSessionLoadStatus = "idle" | "loading" | "ready" | "not_found";

export type DraftSessionPersistStatus = "idle" | "pending" | "saved" | "error";

/** In-memory runtime document for an open draft (survives client-side route changes). */
export interface DraftSessionRecord {
  draftId: string;
  loadStatus: DraftSessionLoadStatus;
  draft: Draft | null;
  script: FootieScript | null;
  persistStatus: DraftSessionPersistStatus;
  persistError?: string;
}

export const EMPTY_DRAFT_SESSION: DraftSessionRecord = {
  draftId: "",
  loadStatus: "idle",
  draft: null,
  script: null,
  persistStatus: "idle",
};
