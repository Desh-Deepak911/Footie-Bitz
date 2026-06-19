import "server-only";

import type OpenAI from "openai";

import { getOpenAIClient } from "@/lib/openai";
import { resolveVoiceoverVoice } from "@/lib/voiceoverOptions";

const TTS_MODEL = "tts-1";
const MAX_INPUT_LENGTH = 4096;

export { resolveVoiceoverVoice } from "@/lib/voiceoverOptions";

export async function generateVoiceoverMp3(
  text: string,
  voice?: string,
): Promise<ArrayBuffer> {
  const openai = getOpenAIClient();
  const resolvedVoice = resolveVoiceoverVoice(voice) as OpenAI.Audio.SpeechCreateParams["voice"];

  const speech = await openai.audio.speech.create({
    model: TTS_MODEL,
    voice: resolvedVoice,
    input: text.slice(0, MAX_INPUT_LENGTH),
    response_format: "mp3",
  });

  return speech.arrayBuffer();
}
