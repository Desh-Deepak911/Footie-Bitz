import { mergeFootballContext } from "@/features/football/utils/football-research.utils";
import type { FootballResearchContext } from "@/features/research/types/football-research.types";
import {
  isResearchContextTextUseful,
  shouldPassResearchContextToScript,
} from "@/features/research/utils/research-context-pass.utils";
import { resolveTop5RankedDataAvailable } from "@/lib/ai/top5-script-prompt.utils";
import type { GenerateScriptResearchPreview, ScriptMode } from "@/types/footiebitz";

export interface ResolveScriptResearchContextInput {
  topic: string;
  scriptMode: ScriptMode;
  manualContext?: string;
  enableResearch?: boolean;
  researchPreview?: GenerateScriptResearchPreview;
}

export interface ResolvedScriptResearchContext {
  context?: string;
  researchApplied: boolean;
  researchWarning?: string;
  usedResearchPreview?: boolean;
  top5RankedDataAvailable?: boolean;
}

export function isReusableResearchPreview(
  preview: GenerateScriptResearchPreview | undefined,
  params: { topic: string; scriptMode: ScriptMode },
): boolean {
  if (!preview?.researchContext || !preview.contextText?.trim()) {
    return false;
  }

  if (preview.topic.trim() !== params.topic.trim()) {
    return false;
  }

  if (preview.mode !== params.scriptMode) {
    return false;
  }

  return shouldPassResearchContextToScript(preview.researchContext);
}

export function applyResolvedResearchContext(input: {
  scriptMode: ScriptMode;
  manualContext?: string;
  researchContext: FootballResearchContext;
  contextText: string;
  usedResearchPreview?: boolean;
}): ResolvedScriptResearchContext {
  const manualContext = input.manualContext?.trim() || undefined;
  const researchWarning =
    input.researchContext.warnings.filter(Boolean).join(" ") || undefined;
  const mergedContext = mergeFootballContext(manualContext, input.contextText);

  if (
    shouldPassResearchContextToScript(input.researchContext) &&
    isResearchContextTextUseful(mergedContext)
  ) {
    return {
      context: mergedContext,
      researchApplied: true,
      researchWarning,
      usedResearchPreview: input.usedResearchPreview,
      top5RankedDataAvailable: resolveTop5RankedDataAvailable({
        scriptMode: input.scriptMode,
        researchContext: input.researchContext,
        contextText: mergedContext,
        researchApplied: true,
      }),
    };
  }

  if (researchWarning) {
    console.warn("football research:", researchWarning);
  }

  return {
    context: manualContext,
    researchApplied: false,
    researchWarning,
    usedResearchPreview: input.usedResearchPreview,
    top5RankedDataAvailable: resolveTop5RankedDataAvailable({
      scriptMode: input.scriptMode,
      researchContext: input.researchContext,
      contextText: mergedContext,
      researchApplied: false,
    }),
  };
}
