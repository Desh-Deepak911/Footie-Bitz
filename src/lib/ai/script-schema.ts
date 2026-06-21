export const FOOTIE_SCRIPT_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    totalDuration: { type: "number" },
    narration: { type: "string" },
    scenes: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          duration: { type: "number" },
          subtitle: { type: "string" },
          captionMode: { type: "string", enum: ["generated", "subtitles"] },
          subtitleEffect: {
            type: "string",
            enum: ["fade-up", "typewriter", "highlight"],
          },
        },
        required: ["id", "duration", "subtitle"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "totalDuration", "narration", "scenes"],
  additionalProperties: false,
} as const;

/** JSON schema for narration-only script generation (no scenes). */
export const STORY_SCRIPT_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    narration: { type: "string" },
  },
  required: ["title", "narration"],
  additionalProperties: false,
} as const;

/** JSON schema for visual scene planning from an existing narration script. */
export function buildScenePlanJsonSchema(sceneCount: number) {
  return {
    type: "object",
    properties: {
      scenes: {
        type: "array",
        minItems: sceneCount,
        maxItems: sceneCount,
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            subtitle: { type: "string" },
            sceneType: {
              type: "string",
              enum: ["intro", "context", "match", "transition", "ending"],
            },
          },
          required: ["id", "subtitle"],
          additionalProperties: false,
        },
      },
    },
    required: ["scenes"],
    additionalProperties: false,
  } as const;
}
