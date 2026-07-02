export interface FetchVoicePreviewParams {
  voice: string;
  speed?: number;
  sampleText?: string;
  stylePreset?: string;
  expressiveDelivery?: boolean;
}

/** Fetches short preview audio from the voice-preview API. */
export async function fetchVoicePreview(params: FetchVoicePreviewParams): Promise<Blob> {
  const response = await fetch("/api/voice-preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    let message = "Preview failed";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.blob();
}
