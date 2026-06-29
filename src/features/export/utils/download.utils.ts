import { getAudioEngine } from "@/features/audio";

type ExportDownloadCaptureHandler = (blob: Blob, filename: string) => void;

let exportDownloadCaptureHandler: ExportDownloadCaptureHandler | null = null;

/** Presentation-only hook so export success UI can offer Download again. */
export function setExportDownloadCaptureHandler(handler: ExportDownloadCaptureHandler | null): void {
  exportDownloadCaptureHandler = handler;
}

export function downloadBlob(blob: Blob, filename: string) {
  exportDownloadCaptureHandler?.(blob, filename);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function fetchNarrationBlob(voiceoverUrl: string): Promise<Blob> {
  return getAudioEngine().fetchVoiceoverBlobByUrl(voiceoverUrl);
}

export async function fetchBackgroundMusicBlob(musicUrl: string): Promise<Blob> {
  return getAudioEngine().fetchBackgroundMusicBlobByUrl(musicUrl);
}
