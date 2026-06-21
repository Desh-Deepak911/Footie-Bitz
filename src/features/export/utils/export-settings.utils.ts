import type { FootieScript } from "@/features/story/types";

import type { ExportQualityPreset, FootieExportOptions } from "./export-quality.utils";
import { getExportQualityPreset } from "./export-quality.utils";

export type ExportFormat = "mp4" | "webm";
export type ExportQualityTier = "standard" | "high";
export type ExportResolution = "1080x1920" | "720x1280";

export interface ExportSettings {
  fileName: string;
  format: ExportFormat;
  quality: ExportQualityTier;
  resolution: ExportResolution;
}

export const DEFAULT_EXPORT_FORMAT: ExportFormat = "mp4";
export const DEFAULT_EXPORT_QUALITY_TIER: ExportQualityTier = "high";
export const DEFAULT_EXPORT_RESOLUTION: ExportResolution = "1080x1920";
export const DEFAULT_EXPORT_FILE_NAME = "story-short";

/** WebM direct download is not offered yet — canvas still captures WebM internally for MP4 transcode. */
export const WEBM_EXPORT_AVAILABLE = false;

const EXPORT_FORMATS: ExportFormat[] = ["mp4", "webm"];
const EXPORT_QUALITY_TIERS: ExportQualityTier[] = ["standard", "high"];
const EXPORT_RESOLUTIONS: ExportResolution[] = ["1080x1920", "720x1280"];

export function slugifyStoryTitle(title: string): string {
  return sanitizeExportFileName(title);
}

/** Slugifies a base file name and strips invalid characters. No extension. */
export function sanitizeExportFileName(fileName: string): string {
  const withoutExtension = fileName.trim().replace(/\.(mp4|webm)$/i, "");
  const slug = withoutExtension
    .toLowerCase()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || DEFAULT_EXPORT_FILE_NAME;
}

export function resolveExportDownloadFormat(
  settings: Pick<ExportSettings, "format">,
  formatOverride?: ExportFormat,
): ExportFormat {
  if (formatOverride) {
    return formatOverride;
  }

  return settings.format === "webm" ? "webm" : "mp4";
}

/** Builds the downloaded file name from export settings. */
export function buildExportDownloadFileName(
  settings: Pick<ExportSettings, "fileName" | "format">,
  formatOverride?: ExportFormat,
): string {
  const extension = resolveExportDownloadFormat(settings, formatOverride);
  const base = sanitizeExportFileName(settings.fileName);

  return `${base}.${extension}`;
}

export function isExportFormat(value: string): value is ExportFormat {
  return EXPORT_FORMATS.includes(value as ExportFormat);
}

export function isExportQualityTier(value: string): value is ExportQualityTier {
  return EXPORT_QUALITY_TIERS.includes(value as ExportQualityTier);
}

export function isExportResolution(value: string): value is ExportResolution {
  return EXPORT_RESOLUTIONS.includes(value as ExportResolution);
}

export function isWebmExportAvailable(): boolean {
  return WEBM_EXPORT_AVAILABLE;
}

/**
 * Applies supported export format rules. WebM requests fall back to MP4 when unavailable.
 */
export function resolveEffectiveExportSettings(settings: ExportSettings): {
  settings: ExportSettings;
  formatFallback: boolean;
} {
  if (settings.format === "webm" && !WEBM_EXPORT_AVAILABLE) {
    return {
      settings: { ...settings, format: "mp4" },
      formatFallback: true,
    };
  }

  return { settings, formatFallback: false };
}

/** Applies defaults and sanitizes partial export settings. */
export function normalizeExportSettings(
  partial: Partial<ExportSettings> | undefined,
  title?: string,
): ExportSettings {
  const fileName = sanitizeExportFileName(
    partial?.fileName?.trim() || slugifyStoryTitle(title ?? ""),
  );

  return {
    fileName,
    format: partial?.format === "webm" ? "webm" : DEFAULT_EXPORT_FORMAT,
    quality:
      partial?.quality === "standard" ? "standard" : DEFAULT_EXPORT_QUALITY_TIER,
    resolution:
      partial?.resolution === "720x1280"
        ? "720x1280"
        : DEFAULT_EXPORT_RESOLUTION,
  };
}

export function resolveExportSettings(
  script: FootieScript,
  options: FootieExportOptions = {},
): ExportSettings {
  return normalizeExportSettings(
    options.exportSettings ?? script.exportSettings,
    script.title,
  );
}

/** Resolves canvas render dimensions and bitrate from export settings or legacy qualityId. */
export function resolveExportRenderPreset(
  script: FootieScript,
  options: FootieExportOptions = {},
): ExportQualityPreset {
  return resolveExportQualityPreset(script, options);
}

function getExportBitrate(
  resolution: ExportResolution,
  quality: ExportQualityTier,
): number {
  if (resolution === "720x1280") {
    return quality === "high" ? 6_000_000 : 4_000_000;
  }

  return quality === "high" ? 8_000_000 : 6_000_000;
}

export function exportSettingsToQualityPreset(
  settings: ExportSettings,
): ExportQualityPreset {
  const is720 = settings.resolution === "720x1280";

  return {
    id: is720 ? "720p" : "1080p",
    label: `${settings.quality} · ${settings.resolution}`,
    width: is720 ? 720 : 1080,
    height: is720 ? 1280 : 1920,
    fps: 30,
    bitrate: getExportBitrate(settings.resolution, settings.quality),
  };
}

/**
 * Resolves render dimensions/bitrate from export settings when present,
 * otherwise falls back to legacy qualityId presets for backward compatibility.
 */
export function resolveExportQualityPreset(
  script: FootieScript,
  options: FootieExportOptions = {},
): ExportQualityPreset {
  if (options.exportSettings || script.exportSettings) {
    return exportSettingsToQualityPreset(resolveExportSettings(script, options));
  }

  if (options.qualityId) {
    return getExportQualityPreset(options.qualityId);
  }

  return exportSettingsToQualityPreset(resolveExportSettings(script, options));
}

export function isHighQualityExportSettings(settings: ExportSettings): boolean {
  return settings.quality === "high" && settings.resolution === "1080x1920";
}
