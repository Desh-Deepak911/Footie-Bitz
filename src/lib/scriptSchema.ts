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
