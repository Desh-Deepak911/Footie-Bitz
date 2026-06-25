import type { FootieScript } from "@/features/story/types";
import type { ExportSettings } from "@/features/story/types";
export type ExportQualityId = "720p" | "1080p" | "1440p" | "4k";
export interface ExportQualityPreset {
    id: ExportQualityId;
    label: string;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
}
export declare const EXPORT_QUALITY_PRESETS: ExportQualityPreset[];
export declare const DEFAULT_EXPORT_QUALITY: ExportQualityId;
export type ExportAudioMode = "silent" | "with-voice";
export declare function getDefaultExportAudioMode(hasVoiceover: boolean): ExportAudioMode;
export interface FootieExportOptions {
    /** @deprecated Prefer `exportSettings` on the script or in options. */
    qualityId?: ExportQualityId;
    audioMode?: ExportAudioMode;
    exportSettings?: Partial<ExportSettings>;
}
export declare function getExportQualityPreset(id: ExportQualityId): ExportQualityPreset;
export declare function isExportQualityId(value: string): value is ExportQualityId;
export declare function isHighQualityExport(qualityId: ExportQualityId): boolean;
export interface ExportProgress {
    status: "preparing" | "rendering" | "loading-voiceover" | "combining" | "finalizing" | "done" | "error";
    progress: number;
    message: string;
    warning?: string;
    /** Drives post-export UI tone when audio mux fallbacks are used. */
    resultKind?: "audio-full" | "audio-voice-only" | "audio-silent" | "default";
}
export declare function getScriptVideoDuration(script: FootieScript): number;
//# sourceMappingURL=export-quality.utils.d.ts.map