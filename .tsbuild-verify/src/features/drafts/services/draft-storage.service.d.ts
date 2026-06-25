import type { FootieScript } from "@/features/story/types";
import type { Draft, DraftStatus, DraftStoreV1, StoryCreationBrief, StoryDraft } from "../types";
/** Single localStorage bucket for all drafts (MVP). */
export declare const DRAFT_STORAGE_KEY = "footiebitz:drafts:v1";
/** Pluggable key/value adapter — swap for Supabase or another backend later. */
export interface DraftStorageAdapter {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
export interface DraftStorageOptions {
    adapter?: DraftStorageAdapter | null;
}
/** Input for creating a new draft record. */
export interface CreateDraftData {
    script: FootieScript;
    creationBrief?: StoryCreationBrief;
    prompt?: string;
    status?: DraftStatus;
    id?: string;
}
/** Partial draft fields accepted by {@link updateDraft}. */
export type UpdateDraftData = Partial<Omit<Draft, "id" | "createdAt">>;
/**
 * Persistence contract for draft storage implementations.
 * The localStorage MVP implements this shape so it can be replaced later.
 */
export interface DraftStorageBackend {
    createDraft(data: CreateDraftData, options?: DraftStorageOptions): Draft;
    getDraft(id: string, options?: DraftStorageOptions): Draft | null;
    updateDraft(id: string, updates: UpdateDraftData, options?: DraftStorageOptions): Draft | null;
    deleteDraft(id: string, options?: DraftStorageOptions): boolean;
    listDrafts(options?: DraftStorageOptions): Draft[];
    saveDraft(draft: Draft, options?: DraftStorageOptions): Draft;
}
/** Default MVP backend — localStorage. Replace this export when moving to Supabase. */
export declare const localDraftStorage: DraftStorageBackend;
export declare function isDraftStorageAvailable(): boolean;
export declare function createDraft(data: CreateDraftData, options?: DraftStorageOptions): Draft;
export declare function getDraft(id: string, options?: DraftStorageOptions): Draft | null;
export declare function updateDraft(id: string, updates: UpdateDraftData, options?: DraftStorageOptions): Draft | null;
export declare function deleteDraft(id: string, options?: DraftStorageOptions): boolean;
export declare function listDrafts(options?: DraftStorageOptions): Draft[];
export declare function saveDraft(draft: Draft, options?: DraftStorageOptions): Draft;
/** @deprecated Prefer {@link listDrafts} — kept for dashboard summaries. */
export declare function listDraftSummaries(options?: DraftStorageOptions): import("..").StoryDraftSummary[];
/** @deprecated Prefer {@link createDraft}. */
export declare function createAndSaveDraft(script: FootieScript, creationBrief?: StoryCreationBrief, adapter?: DraftStorageAdapter | null): StoryDraft;
/** @deprecated Prefer {@link updateDraft} with `{ script }`. */
export declare function updateDraftScript(draftId: string, script: FootieScript, adapter?: DraftStorageAdapter | null): StoryDraft | null;
/** In-memory adapter for tests and future non-browser backends. */
export declare function createMemoryDraftStorageAdapter(initialStore?: DraftStoreV1): DraftStorageAdapter;
//# sourceMappingURL=draft-storage.service.d.ts.map