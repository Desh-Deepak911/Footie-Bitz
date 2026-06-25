import type { FootieScript } from "@/features/story/types";
export declare function useStoryVoiceoverApply(script: FootieScript, onScriptChange: (script: FootieScript) => void): {
    applyVoiceoverChanges: () => Promise<void>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
};
//# sourceMappingURL=useStoryVoiceoverApply.d.ts.map