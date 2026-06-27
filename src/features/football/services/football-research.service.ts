import "server-only";

import {
  buildFootballResearchContextText,
  researchFootballContext as researchStructuredFootballContext,
} from "@/features/research";
import { resolveFootballResearchMode } from "@/features/research/types/football-research.types";
import {
  isResearchContextTextUseful,
  shouldPassResearchContextToScript,
} from "@/features/research/utils/research-context-pass.utils";
import type { ScriptMode } from "@/types/footiebitz";
import { mergeFootballContext } from "../utils/football-research.utils";

export type FootballResearchResult =
  | { success: true; context: string }
  | { success: false; error: string };

export type ResolveScriptGenerationContextResult = {
  context?: string;
  researchApplied: boolean;
  researchWarning?: string;
};

/**
 * @deprecated Prefer `@/features/research` structured `researchFootballContext`.
 * Returns prompt text for legacy callers.
 */
export async function researchFootballContext(input: {
  topic: string;
  scriptMode: ScriptMode;
  manualContext?: string;
}): Promise<FootballResearchResult> {
  const researchContext = await researchStructuredFootballContext({
    topic: input.topic,
    mode: resolveFootballResearchMode(input.scriptMode),
    manualContext: input.manualContext,
  });

  const contextText = buildFootballResearchContextText(researchContext);

  if (
    shouldPassResearchContextToScript(researchContext) &&
    isResearchContextTextUseful(contextText)
  ) {
    return {
      success: true,
      context: contextText,
    };
  }

  const warning = researchContext.warnings[0] ?? "Football research unavailable.";
  if (researchContext.facts.length > 0 || input.manualContext?.trim()) {
    return { success: false, error: warning };
  }

  return { success: false, error: warning };
}

/**
 * Merges manual context with optional API-Football research for script-only generation.
 * Research failures are non-fatal — generation continues with manual/topic-only context.
 */
export async function resolveScriptGenerationContext(input: {
  topic: string;
  scriptMode: ScriptMode;
  manualContext?: string;
  footballResearch?: boolean;
}): Promise<ResolveScriptGenerationContextResult> {
  const manualContext = input.manualContext?.trim() || undefined;

  if (!input.footballResearch) {
    return {
      context: manualContext,
      researchApplied: false,
    };
  }

  const researchContext = await researchStructuredFootballContext({
    topic: input.topic,
    mode: resolveFootballResearchMode(input.scriptMode),
    manualContext,
  });

  const researchWarning = researchContext.warnings.filter(Boolean).join(" ") || undefined;
  const contextText = buildFootballResearchContextText(researchContext);
  const mergedContext = mergeFootballContext(manualContext, contextText);

  if (
    shouldPassResearchContextToScript(researchContext) &&
    isResearchContextTextUseful(mergedContext)
  ) {
    return {
      context: mergedContext,
      researchApplied: true,
      researchWarning,
    };
  }

  if (researchWarning) {
    console.warn("football research:", researchWarning);
  }

  return {
    context: manualContext,
    researchApplied: false,
    researchWarning,
  };
}

export { mergeFootballContext } from "../utils/football-research.utils";
