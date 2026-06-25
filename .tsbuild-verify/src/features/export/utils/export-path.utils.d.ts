import { type ExportFormat, type ExportSettings } from "./export-settings.utils";
/** Browser export pipeline selected by `exportSettings.format`. */
export type ExportPath = ExportFormat;
export interface ResolvedExportPath {
    path: ExportPath;
    /** Original format from settings — never rewritten to another path. */
    format: ExportFormat;
    blocked: boolean;
    blockReason?: string;
}
export declare const EXPORT_PATH_WEBM_UNAVAILABLE_MESSAGE = "WebM export is unavailable. Choose MP4 or try another browser.";
export declare const EXPORT_PATH_WEBM_BACKGROUND_MUSIC_UNSUPPORTED_MESSAGE = "Background music cannot be merged into WebM exports yet. Disable background music or choose MP4 for a full audio mix.";
export declare const EXPORT_PATH_MP4_SLOW_NOTICE = "MP4 conversion runs in the browser and may take several minutes.";
export declare const EXPORT_PATH_WEBM_FAST_NOTICE = "WebM uses the fast browser-native export path.";
/** True when WebM exports can include merged background music via FFmpeg mux. */
export declare const WEBM_BACKGROUND_MUSIC_EXPORT_SUPPORTED = true;
/**
 * Resolves the export pipeline from settings without rewriting the user's format.
 * WebM is never silently converted to MP4.
 */
export declare function resolveExportPath(settings: Pick<ExportSettings, "format">): ResolvedExportPath;
export declare function isWebmExportPath(path: ExportPath): boolean;
export declare function isMp4ExportPath(path: ExportPath): boolean;
/** User-facing notice when WebM is selected but background music cannot be merged. */
export declare function resolveWebmBackgroundMusicExportNotice(options: {
    exportPath: ExportPath;
    backgroundMusicActive: boolean;
}): string | undefined;
export declare function resolveExportPathFormatNotice(path: ExportPath): string;
//# sourceMappingURL=export-path.utils.d.ts.map