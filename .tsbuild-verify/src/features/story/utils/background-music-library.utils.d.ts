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
export declare const BACKGROUND_MUSIC_LIBRARY_CATALOG: BackgroundMusicLibraryTrack[];
/** Public paths that have verified audio assets on disk. Keep in sync with public/music/. */
export declare const SHIPPED_BACKGROUND_MUSIC_FILES: string[];
export declare const BACKGROUND_MUSIC_LIBRARY_EMPTY_MESSAGE = "No built-in tracks yet. Upload your own licensed music.";
export declare function isBackgroundMusicLibraryTrackAvailable(track: BackgroundMusicLibraryTrack, shippedFiles?: readonly string[]): boolean;
/** Catalog entries that have a shipped file in public assets. */
export declare function getAvailableBackgroundMusicLibraryTracks(catalog?: readonly BackgroundMusicLibraryTrack[], shippedFiles?: readonly string[]): BackgroundMusicLibraryTrack[];
export declare const BACKGROUND_MUSIC_LIBRARY_TRACKS: BackgroundMusicLibraryTrack[];
export declare function findBackgroundMusicLibraryTrack(trackId: string | undefined, tracks?: readonly BackgroundMusicLibraryTrack[]): BackgroundMusicLibraryTrack | undefined;
export declare function formatBackgroundMusicLibraryLicenseLabel(track: BackgroundMusicLibraryTrack): string;
//# sourceMappingURL=background-music-library.utils.d.ts.map