/**
 * Export background music mixing verification (run: npm run test:export-background-music).
 */
import assert from "node:assert/strict";

import {
  buildExportBackgroundMusicFilterChain,
  resolveExportBackgroundMusicBedVolume,
  resolveExportBackgroundMusicMixSettings,
} from "@/features/export/utils/export-background-music.utils";
import { PREVIEW_MUSIC_DUCKING_MULTIPLIER } from "@/features/preview/utils";
import type { FootieScript } from "@/features/story/types";

function test(name: string, fn: () => void) {
  fn();
  console.log(`  ✓ ${name}`);
}

const scriptWithMusic: FootieScript = {
  title: "Music Export",
  narration: "Test narration.",
  totalDuration: 12,
  scenes: [
    {
      id: "1",
      start: 0,
      end: 12,
      duration: 12,
      subtitle: "Scene",
    },
  ],
  voiceoverUrl: "blob:voiceover",
  backgroundMusic: {
    enabled: true,
    source: "upload",
    fileUrl: "blob:music-track",
    fileName: "ambient.mp3",
    volume: 0.2,
    duckingEnabled: true,
    fadeIn: true,
    fadeOut: true,
  },
};

console.log("exportBackgroundMusic");

test("resolveExportBackgroundMusicBedVolume ducks under narration when enabled", () => {
  const music = scriptWithMusic.backgroundMusic!;
  assert.equal(
    resolveExportBackgroundMusicBedVolume(music, true),
    0.2 * PREVIEW_MUSIC_DUCKING_MULTIPLIER,
  );
  assert.equal(resolveExportBackgroundMusicBedVolume(music, false), 0.2);
});

test("resolveExportBackgroundMusicMixSettings includes fade windows", () => {
  const settings = resolveExportBackgroundMusicMixSettings(scriptWithMusic, true);
  assert.ok(settings);
  assert.equal(settings?.fadeInSec, 2);
  assert.equal(settings?.fadeOutSec, 2);
});

test("buildExportBackgroundMusicFilterChain applies volume and fades", () => {
  const settings = resolveExportBackgroundMusicMixSettings(scriptWithMusic, true)!;
  const chain = buildExportBackgroundMusicFilterChain(2, 12, settings, "music");

  assert.match(chain, /\[2:a\]/);
  assert.match(chain, /volume=0\.0700/);
  assert.match(chain, /afade=t=in:st=0:d=2/);
  assert.match(chain, /afade=t=out:st=10\.000:d=2/);
  assert.match(chain, /\[music\]$/);
});

console.log("All export background music checks passed.");
