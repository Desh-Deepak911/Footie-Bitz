import { resolveVoiceoverVoice } from "@/lib/utils/voiceoverOptions";

import {
  getVoiceLibraryEntries,
  getVoiceLibraryEntry,
  OPENAI_VOICE_LIBRARY_IDS,
  VOICE_CATEGORY_LABELS,
  VOICE_LIBRARY_CATEGORY_ORDER,
} from "./voice-library.registry";
import type { VoiceLibraryCategoryGroup, VoiceLibraryFilter } from "./voice-library.types";

export { OPENAI_VOICE_LIBRARY_IDS, VOICE_CATEGORY_LABELS, VOICE_LIBRARY_CATEGORY_ORDER };

/** Resolves a stored or unknown voice id to a backend-safe selection for highlighting. */
export function resolveVoiceLibrarySelection(voiceId: unknown): string {
  return resolveVoiceoverVoice(voiceId);
}

/** Returns catalog voices grouped by primary category. */
export function groupVoiceLibraryByCategory(): VoiceLibraryCategoryGroup[] {
  return VOICE_LIBRARY_CATEGORY_ORDER.map((category) => ({
    category,
    label: VOICE_CATEGORY_LABELS[category],
    voices: getVoiceLibraryEntries().filter((entry) => entry.category === category),
  })).filter((group) => group.voices.length > 0);
}

/** Returns voices visible for the active category filter. */
export function filterVoiceLibraryEntries(filter: VoiceLibraryFilter) {
  const entries = getVoiceLibraryEntries();
  if (filter === "all") {
    return entries;
  }

  return entries.filter((entry) => entry.category === filter);
}

/** Returns display metadata for a selected voice, falling back to the resolved id label. */
export function resolveVoiceLibraryDisplayName(voiceId: unknown): string {
  const resolvedId = resolveVoiceLibrarySelection(voiceId);
  return getVoiceLibraryEntry(resolvedId)?.displayName ?? resolvedId;
}

/** True when every resolver-valid voice id exists in the UI catalog. */
export function voiceLibraryCoversResolverVoices(): boolean {
  return OPENAI_VOICE_LIBRARY_IDS.every((voiceId) => Boolean(getVoiceLibraryEntry(voiceId)));
}

/** True when every catalog voice is accepted by the backend resolver unchanged. */
export function voiceLibraryEntriesAreResolverSafe(): boolean {
  return getVoiceLibraryEntries().every(
    (entry) => resolveVoiceoverVoice(entry.id) === entry.id,
  );
}
