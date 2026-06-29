import { prepareStoryVoiceoverForExport } from "@/features/drafts";
import { prepareStoryForExport } from "@/features/export/utils/export-preflight.utils";
import type { FootieScript } from "@/features/story/types";
import { syncFootieScript } from "@/lib/utils/voiceover";

/** Collects export timeline / caption / refit notes for the collapsed diagnostics panel. */
export function buildExportSuccessDiagnostics(
  script: FootieScript,
  options?: {
    runtimeWarning?: string | null;
    runtimeMessage?: string | null;
  },
): string[] {
  const exportScript = prepareStoryVoiceoverForExport(syncFootieScript(script));
  const preflight = prepareStoryForExport(exportScript);
  const diagnostics = preflight.masterTimeline.diagnostics;
  const lines: string[] = [...preflight.warnings];

  if (diagnostics.exportRefitApplied) {
    const refitMs = diagnostics.refitSceneDurationMs ?? preflight.exportDurationMs;
    lines.push(`Voiceover refit applied — scene windows scaled to ${refitMs}ms for export.`);
  }

  if (diagnostics.previewExportTimingMismatchRisk) {
    lines.push("Preview/export timing mismatch risk detected between editor scenes and export refit.");
  }

  const captionTooShort = diagnostics.captionTooShortForAnimationCount ?? 0;
  if (captionTooShort > 0) {
    lines.push(
      `${captionTooShort} subtitle window${captionTooShort === 1 ? "" : "s"} too short for scheduled caption animation.`,
    );
  }

  if (diagnostics.lineCapOverflowRisk) {
    lines.push("Subtitle line-cap overflow risk detected on one or more scenes.");
  }

  if (diagnostics.negativeOrOverlappingEvents) {
    lines.push("Timeline contains negative durations or overlapping events on a track.");
  }

  const optimizerFindings = diagnostics.optimizer?.findings ?? [];
  for (const finding of optimizerFindings) {
    lines.push(`[${finding.severity}] ${finding.rule}: ${finding.message}`);
  }

  if (options?.runtimeWarning?.trim()) {
    lines.push(options.runtimeWarning.trim());
  }

  const runtimeMessage = options?.runtimeMessage?.trim();
  if (
    runtimeMessage &&
    !runtimeMessage.startsWith("Your video is ready") &&
    !runtimeMessage.startsWith("Download ready")
  ) {
    lines.push(runtimeMessage);
  }

  return [...new Set(lines.map((line) => line.trim()).filter(Boolean))];
}
