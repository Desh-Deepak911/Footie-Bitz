import type { FootieScript } from "@/features/story/types";
import type { StoryDraft } from "../types";
interface UseStoryDraftResult {
    draft: StoryDraft | null;
    loading: boolean;
    notFound: boolean;
    saveScript: (script: FootieScript) => void;
}
export declare function useStoryDraft(draftId: string): UseStoryDraftResult;
export {};
//# sourceMappingURL=useStoryDraft.d.ts.map