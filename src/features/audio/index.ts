export type {
  AudioEngineSnapshot,
  BackgroundMusicTrack,
  VoiceoverBlobMaterialization,
  VoiceoverTrack,
} from "./types/audio-engine.types";

export type {
  AudioEngineState,
  AudioMix,
  AudioTrack,
  AudioTrackType,
} from "./types/audio.types";

export type {
  CanonicalVoiceover,
  VoiceoverAvailability,
  VoiceoverSource,
} from "./utils/canonical-voiceover.utils";

export {
  getCanonicalVoiceover,
  getVoiceoverAvailability,
  readVoiceoverAudioBase64,
  resolveCanonicalVoiceoverFromUrlFields,
  resolveVoiceoverSourceFromUrlFields,
} from "./utils/canonical-voiceover.utils";

export {
  hasPlayableVoiceoverSource,
  inferVoiceoverMimeTypeFromBytes,
  materializePlayableVoiceoverFromBase64,
  resolvePlayableVoiceoverFromStory,
  VOICEOVER_UNPLAYABLE_MESSAGE,
  type PlayableVoiceoverDiagnostics,
  type PlayableVoiceoverResolution,
  type PlayableVoiceoverSrcKind,
} from "./utils/playable-voiceover-src.utils";

export {
  hasEditorVoiceoverStaleReasons,
  hasNarrationTextVoiceoverMismatch,
  hasVoiceSettingsVoiceoverMismatch,
  resolveEditorVoiceoverStatus,
  type EditorVoiceoverStatus,
  type EditorVoiceoverStatusKind,
} from "./utils/voiceover-status.utils";

export {
  AudioEngine,
  buildAudioMixFromStory,
  getAudioEngine,
  getBackgroundTrack,
  getMasterAudioDurationMs,
  getVoiceoverTrack,
  resetAudioEngineForTests,
  resolveAudioEngineSnapshot,
  updateBackgroundTrack,
  updateVoiceoverTrack,
} from "./services/audio-engine.service";

export type { VoiceoverTrackUpdate } from "./services/audio-engine.service";

export { fetchAudioBlobFromUrl, normalizeVoiceoverBlob } from "./utils/audio-blob.utils";
export {
  classifyAudioSrcType,
  getAudioEngineDebugState,
  isAudioDebugEnabled,
  logAudioEngineState,
  resolveExportAudioSource,
  type AudioEngineDebugState,
} from "./utils/audio-debug.utils";
