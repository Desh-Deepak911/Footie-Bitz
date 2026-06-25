import type { FootieScript } from "@/features/story/types";
import type { ExportQualityPreset, FootieExportOptions } from "./export-quality.utils";
export type ExportFormat = "mp4" | "webm";
export type ExportQualityTier = "standard" | "high";
export type ExportResolution = "1080x1920" | "720x1280";
export interface ExportSettings {
    fileName: string;
    format: ExportFormat;
    quality: ExportQualityTier;
    resolution: ExportResolution;
}
export declare const DEFAULT_EXPORT_FORMAT: ExportFormat;
export declare const DEFAULT_EXPORT_QUALITY_TIER: ExportQualityTier;
export declare const DEFAULT_EXPORT_RESOLUTION: ExportResolution;
export declare const DEFAULT_EXPORT_FILE_NAME = "story-short";
/** Fast browser-native path — canvas captures WebM; MP4 requires a separate transcode pass. */
export declare const WEBM_EXPORT_AVAILABLE = true;
export declare function slugifyStoryTitle(title: string): string;
/** Slugifies a base file name and strips invalid characters. No extension. */
export declare function sanitizeExportFileName(fileName: string): string;
export declare function resolveExportDownloadFormat(settings: Pick<ExportSettings, "format">, formatOverride?: ExportFormat): ExportFormat;
/** Builds the downloaded file name from export settings. */
export declare function buildExportDownloadFileName(settings: Pick<ExportSettings, "fileName" | "format">, formatOverride?: ExportFormat): string;
export declare function isExportFormat(value: string): value is ExportFormat;
export declare function isExportQualityTier(value: string): value is ExportQualityTier;
export declare function isExportResolution(value: string): value is ExportResolution;
export declare function isWebmExportAvailable(): boolean;
/**
 * Validates export format availability. Settings are never rewritten to another format.
 * Use {@link resolveExportPath} for pipeline selection.
 */
export declare function resolveEffectiveExportSettings(settings: ExportSettings): {
    settings: ExportSettings;
    /** @deprecated No silent format fallback — use `blocked` instead. */
    formatFallback: boolean;
    blocked: boolean;
    blockReason?: string;
};
/** Applies defaults and sanitizes partial export settings. */
export declare function normalizeExportSettings(partial: Partial<ExportSettings> | undefined, title?: string): ExportSettings;
export declare function resolveExportSettings(script: FootieScript, options?: FootieExportOptions): ExportSettings;
/** Resolves canvas render dimensions and bitrate from export settings or legacy qualityId. */
export declare function resolveExportRenderPreset(script: FootieScript, options?: FootieExportOptions): ExportQualityPreset;
export declare function exportSettingsToQualityPreset(settings: ExportSettings): ExportQualityPreset;
/**
 * Resolves render dimensions/bitrate from export settings when present,
 * otherwise falls back to legacy qualityId presets for backward compatibility.
 */
export declare function resolveExportQualityPreset(script: FootieScript, options?: FootieExportOptions): ExportQualityPreset;
export declare function isHighQualityExportSettings(settings: ExportSettings): boolean;
//# sourceMappingURL=export-settings.utils.d.ts.map