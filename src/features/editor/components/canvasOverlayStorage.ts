const CANVAS_EDIT_HINTS_STORAGE_KEY = "footiebitz.canvas-edit-hints.dismissed";

/** Whether first-time canvas edit hints were dismissed in this browser. */
export function areCanvasEditHintsDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(CANVAS_EDIT_HINTS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Persists hint dismissal for the current browser session storage. */
export function dismissCanvasEditHints(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CANVAS_EDIT_HINTS_STORAGE_KEY, "1");
  } catch {
    // Ignore storage failures — hints may reappear next visit.
  }
}
