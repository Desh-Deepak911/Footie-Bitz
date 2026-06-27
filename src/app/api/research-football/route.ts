import "server-only";

import { NextResponse } from "next/server";

import {
  buildFootballResearchContextText,
  researchFootballContext,
} from "@/features/research";
import type { FootballResearchContext } from "@/features/research/types/football-research.types";
import { resolveFootballResearchMode } from "@/features/research/types/football-research.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ResearchFootballRequest {
  topic?: string;
  mode?: unknown;
  manualContext?: string;
}

interface ResearchFootballResponse {
  researchContext: FootballResearchContext;
  contextText: string;
}

function buildResponse(researchContext: FootballResearchContext): ResearchFootballResponse {
  return {
    researchContext,
    contextText: buildFootballResearchContextText(researchContext),
  };
}

function fallbackResearchContext(input: {
  topic: string;
  mode: ReturnType<typeof resolveFootballResearchMode>;
  manualContext?: string;
  warnings: string[];
}): FootballResearchContext {
  const manualFacts = input.manualContext?.trim()
    ? input.manualContext
        .trim()
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  return {
    mode: input.mode,
    topic: input.topic,
    summary: `Research brief: ${input.topic}`,
    facts: manualFacts,
    warnings: input.warnings,
    source: manualFacts.length > 0 ? "manual" : "fallback",
  };
}

export async function POST(request: Request) {
  let body: ResearchFootballRequest;

  try {
    body = (await request.json()) as ResearchFootballRequest;
  } catch {
    const researchContext = fallbackResearchContext({
      topic: "",
      mode: "story",
      warnings: ["Invalid request body."],
    });
    return NextResponse.json(buildResponse(researchContext), { status: 400 });
  }

  const topic = body.topic?.trim();
  const mode = resolveFootballResearchMode(body.mode);
  const manualContext = body.manualContext?.trim() || undefined;

  if (!topic) {
    const researchContext = fallbackResearchContext({
      topic: "",
      mode,
      manualContext,
      warnings: ["Topic is required."],
    });
    return NextResponse.json(buildResponse(researchContext), { status: 400 });
  }

  try {
    const researchContext = await researchFootballContext({
      topic,
      mode,
      manualContext,
    });

    return NextResponse.json(buildResponse(researchContext));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[research-football]", error instanceof Error ? error.message : error);
    }

    const researchContext = fallbackResearchContext({
      topic,
      mode,
      manualContext,
      warnings: [
        error instanceof Error ? error.message : "Football research failed.",
      ],
    });

    return NextResponse.json(buildResponse(researchContext));
  }
}
