export type Tone = "dramatic" | "funny" | "tactical" | "news" | "emotional";

export type QualityMode = "cheap" | "balanced" | "best";

export type SceneType = "intro" | "context" | "match" | "transition" | "ending";

export interface FootieScene {
  id: string;
  start: number;
  end: number;
  duration: number;
  subtitle: string;
  sceneType?: SceneType;
  uploadedImage?: string;
}

export interface FootieScript {
  title: string;
  totalDuration: number;
  narration: string;
  scenes: FootieScene[];
  voiceoverUrl?: string;
}

export interface GenerateScriptRequest {
  topic: string;
  tone: Tone;
  duration: number;
  qualityMode?: QualityMode;
}

export interface GenerateScriptResponse {
  success: boolean;
  data?: FootieScript;
  error?: string;
}
