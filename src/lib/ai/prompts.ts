import type { Tone } from "@/types/footiebitz";

const TONE_GUIDANCE: Record<Tone, string> = {
  dramatic:
    "Build tension like a prestige sports documentary — weight, silence, and consequence in every line.",
  funny:
    "Sharp and observational, like a witty football storyteller — never slapstick, always grounded in the game.",
  tactical:
    "Thoughtful and analytical — explain decisions, patterns, and turning points with clarity, not jargon.",
  news:
    "Direct and authoritative — headline energy with documentary depth, not bullet-point recaps.",
  emotional:
    "Human and reflective — fans, identity, memory, and what the moment meant beyond the scoreline.",
};

const EXAMPLE_JSON = `{
  "title": "When Madrid and Barça Stopped Pretending",
  "totalDuration": 45,
  "narration": "For decades, this rivalry was more than football — it was politics, pride, and proof. Every meeting carried the weight of cities that never needed an excuse to disagree. When form dipped and doubt crept in, neither side could afford to look weak. The stakes were never just three points; they were identity on a knife edge. And in moments like these, history does not stay in the past — it walks onto the pitch with them.",
  "scenes": [
    {
      "id": "1",
      "start": 0,
      "end": 9,
      "duration": 9,
      "subtitle": "More than a derby"
    },
    {
      "id": "2",
      "start": 9,
      "end": 18,
      "duration": 9,
      "subtitle": "Pride on the line"
    },
    {
      "id": "3",
      "start": 18,
      "end": 27,
      "duration": 9,
      "subtitle": "Form fades, pressure rises"
    },
    {
      "id": "4",
      "start": 27,
      "end": 36,
      "duration": 9,
      "subtitle": "Identity at stake"
    },
    {
      "id": "5",
      "start": 36,
      "end": 45,
      "duration": 9,
      "subtitle": "History walks out with them"
    }
  ]
}`;

export function buildFootieScriptPrompt(
  topic: string,
  tone: Tone,
  duration: number,
): string {
  const toneGuide = TONE_GUIDANCE[tone];
  const durationMin = Math.max(30, duration - 5);
  const durationMax = Math.min(60, duration + 5);

  return `You are a football documentary writer for FootieBitz.

Your job: turn the user's topic into one continuous narrated short — cinematic, informative, and emotionally grounded — lasting roughly ${duration} seconds (${durationMin}–${durationMax}s).

Content brief:
"${topic}"

Tone: ${tone} — ${toneGuide}

Story goals:
- Write one cohesive narrated short, not a list of facts.
- Open narration with a strong hook that pulls the viewer in immediately.
- Explain history, context, rivalry, stakes, or development tied to the brief.
- If the brief mentions multiple matches, weave them into one unified story arc — do not treat them as separate segments.
- Make narration rich and descriptive. Use full sentences and vivid language. Never reduce the story to one-liners or slogan-style lines.
- Subtitles are on-screen text only: short, punchy phrases (max 12 words). They must not repeat or paraphrase the full narration.

Hard rules:
- Return JSON only. No markdown. No code fences. No commentary before or after the JSON.
- Do not include extra metadata or image fields beyond the schema.
- Do not invent exact scores, dates, minute marks, records, or statistics unless the brief states them clearly.
- If a fact is uncertain, speak in general terms — tension, reputation, momentum, rivalry, consequence — rather than fabricating specifics.
- Split the narration into exactly 5 timed scenes.
- Scene durations must sum to totalDuration (within ±2 seconds of ${duration}s).
- Each scene needs id, start, end, duration, and subtitle. Times must be contiguous: scene 1 starts at 0, each scene's start equals the previous scene's end, and the final scene's end equals totalDuration.
- duration must equal end minus start for every scene.

Output shape:
${EXAMPLE_JSON}`;
}

const STORY_SCRIPT_EXAMPLE_JSON = `{
  "title": "When Madrid and Barça Stopped Pretending",
  "narration": "For decades, this rivalry was more than football — it was politics, pride, and proof. Every meeting carried the weight of cities that never needed an excuse to disagree. When form dipped and doubt crept in, neither side could afford to look weak. The stakes were never just three points; they were identity on a knife edge. And in moments like these, history does not stay in the past — it walks onto the pitch with them."
}`;

export function buildStoryScriptPrompt(
  topic: string,
  tone: Tone,
  duration: number,
): string {
  const toneGuide = TONE_GUIDANCE[tone];
  const durationMin = Math.max(15, duration - 5);
  const durationMax = Math.min(60, duration + 5);

  return `Generate a voiceover-ready narration script for a YouTube Short.

You are a football storyteller for FootieBitz. Write one continuous spoken script — cinematic, informative, and emotionally grounded — meant to be read aloud as the full voiceover.

Target length when spoken: roughly ${duration} seconds (${durationMin}–${durationMax}s).

Content brief:
"${topic}"

Tone: ${tone} — ${toneGuide}

Writing rules:
- Return JSON only. No markdown. No code fences. No commentary before or after the JSON.
- Output exactly two fields: \`title\` and \`narration\`.
- Do not output scenes, captions, subtitles, timestamps, image prompts, hashtags, or extra metadata.
- Write one cohesive narration — not a list of facts or bullet points.
- Open with a strong hook. Use full sentences and vivid language suitable for TTS.
- Do not invent exact scores, dates, minute marks, records, or statistics unless the brief states them clearly.
- If a fact is uncertain, speak in general terms rather than fabricating specifics.

Output shape:
${STORY_SCRIPT_EXAMPLE_JSON}`;
}

function buildScenePlanExampleJson(sceneCount: number): string {
  const subtitles = [
    "More than a derby",
    "Pride on the line",
    "Form fades, pressure rises",
    "Identity at stake",
    "History walks out with them",
    "The crowd holds its breath",
    "Legacy written tonight",
  ];

  const scenes = Array.from({ length: sceneCount }, (_, index) => ({
    id: String(index + 1),
    subtitle: subtitles[index % subtitles.length],
    sceneType:
      index === 0
        ? "intro"
        : index === sceneCount - 1
          ? "ending"
          : index === Math.floor(sceneCount / 2)
            ? "match"
            : "context",
  }));

  return JSON.stringify({ scenes }, null, 2);
}

export function buildScenePlanPrompt(
  prompt: string,
  script: { title: string; narration: string },
  sceneCount: number,
  voiceoverDurationMs: number,
): string {
  const voiceoverDurationSec = Math.round(voiceoverDurationMs / 1000);
  const sceneDurationSec = Math.max(1, Math.round(voiceoverDurationSec / sceneCount));

  return `Plan visual scenes for a YouTube Short that already has a finished voiceover script.

The narration is locked — do not rewrite, extend, shorten, or replace it. Your job is to design ${sceneCount} visual scene beats that support what the narrator says.

Content brief:
"${prompt}"

Story title:
"${script.title}"

Full narration (read-only — do not output this again):
"""${script.narration}"""

Timing (already decided — do not output timestamps):
- Total voiceover: ~${voiceoverDurationSec}s (${voiceoverDurationMs}ms)
- Scenes: ${sceneCount}
- ~${sceneDurationSec}s per scene (even split)

Scene planning rules:
- Return JSON only. No markdown. No code fences. No commentary.
- Output exactly ${sceneCount} scenes in playback order.
- Each scene needs \`id\` and \`subtitle\` (short on-screen caption, max 12 words).
- Optional \`sceneType\`: intro | context | match | transition | ending.
- Subtitles are visual captions only — punchy phrases, not the full narration text.
- Do not output narration, voiceover copy, image prompts, durations, or timestamps.
- Do not invent new story facts beyond what the narration supports.
- Map scenes sequentially across the narration from opening hook to closing beat.

Output shape:
${buildScenePlanExampleJson(sceneCount)}`;
}
