import type { FootieScript } from "@/features/story/types";
import { type FootieExportPayload } from "./export-payload.service";
import { type ExportProgress, type ExportQualityPreset, type FootieExportOptions } from "@/features/export/utils/export-quality.utils";
export interface ExportFrameTiming {
    sceneElapsedMs: number;
    sceneDurationMs: number;
}
export declare function exportSilentVideoBlob(script: FootieScript, qualityPreset: ExportQualityPreset, onProgress?: (progress: ExportProgress) => void, payloadOverride?: FootieExportPayload, exportDurationSec?: number): Promise<Blob>;
export declare function exportFootieShort(script: FootieScript, onProgress: (progress: ExportProgress) => void, options?: FootieExportOptions): Promise<void>;
//# sourceMappingURL=video-render.service.d.ts.map