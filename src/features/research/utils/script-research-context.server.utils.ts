import "server-only";

import { researchFootballContext } from "@/features/research/services/football-research.service";
import { resolveFootballResearchMode } from "@/features/research/types/football-research.types";
import { buildFootballResearchContextText } from "@/features/research/utils/football-context-builder";
import {
  applyResolvedResearchContext,
  isReusableResearchPreview,
  type ResolveScriptResearchContextInput,
  type ResolvedScriptResearchContext,
} from "@/features/research/utils/script-research-context.utils";

async function resolveResearchPayload(input: ResolveScriptResearchContextInput): Promise<{
  researchContext: Awaited<ReturnType<typeof researchFootballContext>>;
  contextText: string;
  usedResearchPreview: boolean;
}> {
  if (
    isReusableResearchPreview(input.researchPreview, {
      topic: input.topic,
      scriptMode: input.scriptMode,
    })
  ) {
    const preview = input.researchPreview!;
    const contextText =
      preview.contextText.trim() ||
      buildFootballResearchContextText(preview.researchContext);

    return {
      researchContext: preview.researchContext,
      contextText,
      usedResearchPreview: true,
    };
  }

  const manualContext = input.manualContext?.trim() || undefined;
  const researchContext = await researchFootballContext({
    topic: input.topic,
    mode: resolveFootballResearchMode(input.scriptMode),
    manualContext,
  });

  return {
    researchContext,
    contextText: buildFootballResearchContextText(researchContext),
    usedResearchPreview: false,
  };
}

/** Resolves merged manual + researched context for script-only generation. */
export async function resolveScriptResearchContext(
  input: ResolveScriptResearchContextInput,
): Promise<ResolvedScriptResearchContext> {
  const manualContext = input.manualContext?.trim() || undefined;

  if (!input.enableResearch) {
    return {
      context: manualContext,
      researchApplied: false,
      top5RankedDataAvailable: false,
    };
  }

  const { researchContext, contextText, usedResearchPreview } =
    await resolveResearchPayload(input);

  return applyResolvedResearchContext({
    scriptMode: input.scriptMode,
    manualContext,
    researchContext,
    contextText,
    usedResearchPreview,
  });
}
