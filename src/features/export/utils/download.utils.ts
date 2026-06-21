export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function fetchNarrationBlob(voiceoverUrl: string): Promise<Blob> {
  const response = await fetch(voiceoverUrl);
  if (!response.ok) {
    throw new Error("Failed to load narration audio");
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    throw new Error("Narration audio is empty");
  }

  if (blob.type.includes("audio")) {
    return blob;
  }

  return new Blob([await blob.arrayBuffer()], { type: "audio/mpeg" });
}
