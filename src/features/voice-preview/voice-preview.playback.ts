type VoicePreviewPlaybackListener = (activeVoiceId: string | null) => void;

interface ActiveVoicePreview {
  voiceId: string;
  audio: HTMLAudioElement;
  objectUrl: string;
}

let activePreview: ActiveVoicePreview | null = null;
const listeners = new Set<VoicePreviewPlaybackListener>();

function notifyListeners(): void {
  const activeVoiceId = activePreview?.voiceId ?? null;
  for (const listener of listeners) {
    listener(activeVoiceId);
  }
}

export function getActiveVoicePreviewVoiceId(): string | null {
  return activePreview?.voiceId ?? null;
}

export function subscribeVoicePreviewPlayback(
  listener: VoicePreviewPlaybackListener,
): () => void {
  listeners.add(listener);
  listener(getActiveVoicePreviewVoiceId());
  return () => {
    listeners.delete(listener);
  };
}

/** Stops any active preview playback and releases object URLs. */
export function stopVoicePreview(): void {
  if (!activePreview) {
    return;
  }

  const { audio, objectUrl } = activePreview;
  activePreview = null;

  audio.onended = null;
  audio.onerror = null;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  URL.revokeObjectURL(objectUrl);

  notifyListeners();
}

export async function startVoicePreview(
  voiceId: string,
  blob: Blob,
  callbacks?: {
    onEnded?: () => void;
    onError?: () => void;
  },
): Promise<void> {
  stopVoicePreview();

  const objectUrl = URL.createObjectURL(blob);
  const audio = new Audio(objectUrl);
  activePreview = { voiceId, audio, objectUrl };
  notifyListeners();

  audio.onended = () => {
    callbacks?.onEnded?.();
    stopVoicePreview();
  };

  audio.onerror = () => {
    if (activePreview?.audio !== audio) {
      return;
    }

    stopVoicePreview();
    callbacks?.onError?.();
  };

  try {
    await audio.play();
  } catch {
    if (activePreview?.audio === audio) {
      stopVoicePreview();
      callbacks?.onError?.();
    }
    throw new Error("Couldn't play preview");
  }
}

/** Resets playback state — verification helper only. */
export function resetVoicePreviewPlaybackForTests(): void {
  activePreview = null;
  listeners.clear();
}
