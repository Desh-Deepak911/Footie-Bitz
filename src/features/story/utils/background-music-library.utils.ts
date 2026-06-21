/**
 * Built-in background music catalog metadata.
 * Only entries with matching files under public/ are surfaced in the UI.
 */
export interface BackgroundMusicLibraryTrack {
  id: string;
  name: string;
  mood: string;
  artist: string;
  fileUrl: string;
  license: string;
  attributionRequired: boolean;
  attributionText?: string;
}

/**
 * Sample catalog metadata. Add entries here when licensed audio is placed under
 * public/music/. Do not add copyrighted files or claim royalty-free use without
 * explicit license metadata on each track.
 */
export const BACKGROUND_MUSIC_LIBRARY_CATALOG: BackgroundMusicLibraryTrack[] = [
  // {
  //   id: "stadium-pulse",
  //   name: "Stadium Pulse",
  //   mood: "Energetic",
  //   artist: "FootieBitz Sample Library",
  //   fileUrl: "/music/stadium-pulse.mp3",
  //   license: "CC0 1.0 Universal",
  //   attributionRequired: false,
  // },
];

/** Public paths that have verified audio assets on disk. Keep in sync with public/music/. */
export const SHIPPED_BACKGROUND_MUSIC_FILES: string[] = [];

export const BACKGROUND_MUSIC_LIBRARY_EMPTY_MESSAGE =
  "No built-in tracks yet. Upload your own licensed music.";

export function isBackgroundMusicLibraryTrackAvailable(
  track: BackgroundMusicLibraryTrack,
  shippedFiles: readonly string[] = SHIPPED_BACKGROUND_MUSIC_FILES,
): boolean {
  return Boolean(track.fileUrl?.trim()) && shippedFiles.includes(track.fileUrl);
}

/** Catalog entries that have a shipped file in public assets. */
export function getAvailableBackgroundMusicLibraryTracks(
  catalog: readonly BackgroundMusicLibraryTrack[] = BACKGROUND_MUSIC_LIBRARY_CATALOG,
  shippedFiles: readonly string[] = SHIPPED_BACKGROUND_MUSIC_FILES,
): BackgroundMusicLibraryTrack[] {
  return catalog.filter((track) => isBackgroundMusicLibraryTrackAvailable(track, shippedFiles));
}

export const BACKGROUND_MUSIC_LIBRARY_TRACKS = getAvailableBackgroundMusicLibraryTracks();

export function findBackgroundMusicLibraryTrack(
  trackId: string | undefined,
  tracks: readonly BackgroundMusicLibraryTrack[] = BACKGROUND_MUSIC_LIBRARY_TRACKS,
): BackgroundMusicLibraryTrack | undefined {
  if (!trackId?.trim()) {
    return undefined;
  }

  return tracks.find((track) => track.id === trackId);
}

export function formatBackgroundMusicLibraryLicenseLabel(
  track: BackgroundMusicLibraryTrack,
): string {
  return track.license?.trim() || "License not specified";
}
