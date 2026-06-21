# Editing

The Editing layer is where creators refine AI output after generation. Every change is a **local, immediate mutation** of `FootieScript` in React state — no server round-trip, no automatic re-generation.

**Entry point:** `StoryWorkspace` → `TimelineEditor` + `SceneCard`  
**State layer:** `src/lib/voiceover.ts`  
**UI:** `src/features/editor/components/`

---

## Editor philosophy

FootieBitz treats the generated story as a **first draft**. The editor's job is to make everything refinable without surprise overwrites.

### Everything editable

After generation, creators can change:

- Story title and full narration text
- Scene order, count, type, and duration
- Per-scene captions, subtitle copy, caption mode, and effects
- Uploaded images — position, zoom, fit/fill, Ken Burns motion
- Transitions between scenes
- Voice and speed settings

No field is locked behind re-generation except what inherently requires new audio (see below).

### No regeneration unless explicitly requested

Editing never calls OpenAI. The only paths that hit the server after initial generation are:

| Action | Trigger | API |
|--------|---------|-----|
| Regenerate voiceover | User clicks **Apply Changes** in `VoiceSettingsCard` | `POST /api/generate-voiceover` |
| Create new story | User submits a new brief in `StoryComposer` | `POST /api/generate-script` |

Scene edits, image uploads, caption changes, duration tweaks, and transition updates are **pure client-side** state updates.

### User changes should never overwrite existing edits

State helpers are designed to merge patches, not replace whole stories:

- **`applySceneUpdate()`** — patches one scene; recalculates timings; does not touch narration or voiceover
- **`applySceneImageSettings()`** — patches transform fields only; URL unchanged
- **`applyTransitionUpdate()`** — patches transition metadata only
- **`applyStoryVoiceSettings()`** — updates voice/speed prefs **without** regenerating audio
- **`syncFootieScript(next, previous)`** — normalization pass that uses `previous` to preserve user subtitle text, skip unnecessary narration excerpt re-sync, and keep transition-only edits intact

When narration text changes, `applyStoryUpdate()` clears the stale voiceover blob (audio no longer matches copy) but **does not** auto-regenerate — the user must click Apply Changes.

When voiceover is explicitly regenerated, `applyVoiceoverChanges()` refits scene **timings** proportionally but preserves scene content, captions, images, and transitions.

```mermaid
flowchart LR
  Edit[User edit] --> Patch[apply*Update helpers]
  Patch --> Sync[syncFootieScript with previous]
  Sync --> State[FootieScript in React]
  State --> Preview[VideoPreview]
  State --> Export[ExportPanel]

  Apply[Apply Changes button] --> API[/api/generate-voiceover]
  API --> Refit[refitScenesToVoiceoverDuration]
  Refit --> Sync
```

---

## UI structure

`StoryWorkspace` lays out the post-generation studio:

| Section | Component | Editable content |
|---------|-----------|------------------|
| Story Draft | `StoryReview` | Title, full narration |
| Production Timeline | `TimelineEditor` | Scenes, transitions, images, captions |
| Voice Settings | `VoiceSettingsCard` | Voice, speed (+ explicit Apply) |
| Narration | `NarrationPanel` | Audio preview only (read-only) |
| Preview | `VideoPreview` | Playback (reflects edits live) |
| Export | `ExportPanel` | Quality, audio mode, download |

`TimelineEditor` renders in **storyboard** mode inside the workspace — a vertical list of `SceneCard` and `TransitionCard` items.

---

## Scene editing

### Purpose

Adjust the production timeline structure: which scenes exist, in what order, and what type they are.

### Operations

Implemented in `timeline.utils.ts`, wired through `TimelineEditor`:

| Action | Behavior |
|--------|----------|
| **Add scene** | Inserts blank scene (3s default) at chosen position |
| **Duplicate** | Clones scene including image settings and caption fields |
| **Delete** | Removes scene; syncs timeline items |
| **Move up / down** | Reorders scenes; `recalculateSceneTimings()` |
| **Add buffer scene** | Quick-insert Intro (3s), Context (4s), Transition (2s), or Ending (4s) |
| **Add transition** | Inserts `TransitionTimelineItem` after selected scene |
| **Scene type** | Optional `intro`, `context`, `match`, `transition`, `ending` |

### Scene types and placeholders

Scenes without uploaded images show a type-labelled gradient placeholder in preview and export. Buffer scenes help creators pad the timeline around narration beats without changing the voiceover script.

### State helper

`applyScenesUpdate()` replaces the full scene list and rebuilds timeline items. Individual patches use `applySceneUpdate()`.

---

## Image editing

### Purpose

Replace AI placeholders with creator-provided visuals and control how each image appears in the 9:16 frame.

### Upload

| Detail | Value |
|--------|-------|
| Component | `MediaPicker` / upload zone on `SceneCard` |
| Formats | PNG, JPG, WEBP |
| Storage | `SceneImage.url` as client `blob:` URL |
| Remove | Clears image; placeholder returns |

Legacy `uploadedImage` string URLs migrate to `SceneImage` on `syncFootieScript()`.

### Image position

Drag to pan inside the frame. Stored as normalized `SceneImage.x` and `SceneImage.y`.

- Editor: `SceneFrameImage` — mouse and touch drag
- Selecting a scene card activates that scene in preview (`onActivate`)
- Draw: `drawSceneImageInFrame()` — shared by preview and export

### Image zoom

Manual scale multiplier on `SceneImage.scale`.

- Range: **0.5× – 3×** (`MIN_SCENE_IMAGE_SCALE`, `MAX_SCENE_IMAGE_SCALE`)
- UI: slider in `SceneImageZoomControl`
- **Reset** restores default transform via `applyResetSceneImageSettings()`

### Fit / Fill

`SceneImage.fitMode` controls letterbox vs cover:

| Mode | Behavior |
|------|----------|
| `fit` | Full image visible; may letterbox |
| `fill` | Image covers frame; may crop edges |

Toggle in `SceneImageZoomControl`. Default when omitted: **fill**.

### State helpers

- `applySceneImageSettings()` — pan, zoom, fit, motion patches
- `applyResetSceneImageSettings()` — one-click reset

Image edits never trigger AI or affect narration.

---

## Subtitle editing

### Purpose

Control what text appears on screen and how it is timed within each scene.

Two distinct editing surfaces depending on caption mode (see [Caption modes](#caption-modes)).

### Subtitles mode (`captionMode: "subtitles"`)

| Field | Editor | Notes |
|-------|--------|-------|
| `subtitleText` | Textarea on `SceneCard` | Editable on-screen copy |
| `subtitleEffect` | `SubtitleEffectControl` | fade-up, typewriter, highlight |

**Chunking:** `splitSubtitleChunks()` breaks text into timed phrases (~5 words / 34 chars max). Chunks divide scene duration evenly. One chunk visible at a time.

**Default seed:** Switching to subtitles mode seeds `subtitleText` from the scene narration excerpt if empty (`mergeSubtitleTextOnSubtitlesModeSwitch`). Existing user text is never overwritten.

**UX copy on scene card:** *"Subtitles are based on narration, but you can edit them for better on-screen readability."*

### Generated mode (`captionMode: "generated"`)

| Field | Editor | Notes |
|-------|--------|-------|
| `subtitle` | Textarea on `SceneCard` | Static caption for full scene |

No chunk timing — caption displays for the entire scene duration.

### Subtitle effects

Apply in subtitles mode (and stylistically in generated mode):

| Effect | Behavior |
|--------|----------|
| **fade-up** | Opacity + upward motion at chunk start (default) |
| **typewriter** | Progressive character reveal |
| **highlight** | Animated highlight bar + pill per line |

Preview: `subtitleEffectPreview.tsx`, `SubtitleOverlay.tsx`  
Export: `export-caption-canvas.utils.ts`

Max **3 visible lines**, **90% frame width** when wrapped.

### What subtitle editing does not do

- No manual chunk boundary editor — algorithm splits automatically
- No word-level sync to audio waveform
- Editing `subtitleText` does not change story `narration` or voiceover MP3

---

## Voice settings

### Purpose

Choose narrator voice and speed. Changes to preferences are stored immediately; audio regeneration is a separate explicit step.

### Controls

`VoiceSettingsCard` — story-level, not per-scene:

| Setting | Options | Storage |
|---------|---------|---------|
| Voice | alloy, echo, fable, onyx, nova, shimmer | `FootieScript.voiceSettings.voice` |
| Speed | 0.75×, 0.9×, 1.0×, 1.1×, 1.25×, 1.4× | `FootieScript.voiceSettings.speed` |

Changing voice or speed updates prefs via `applyStoryVoiceSettings()` — **no API call**.

### Apply Changes (explicit regeneration)

The **Apply Changes** button calls `useStoryVoiceoverApply` → `POST /api/generate-voiceover`.

On success, `applyVoiceoverChanges()`:

1. Replaces `voiceoverUrl` and `voiceoverDurationMs`
2. Calls `refitScenesToVoiceoverDuration()` — proportional timing redistribution
3. Preserves scene content, captions, images, and transitions

On failure, state rolls back to the pre-request baseline (`restoreVoiceoverBaseline`).

Helper text: *"Regenerates the voiceover and redistributes scene timings proportionally."*

### Narration text changes

Editing narration in `StoryReview` clears the stale voiceover blob (`applyStoryUpdate` → `narrationNeedsRefresh`) but does **not** auto-regenerate. The user sees narration panel without audio until they click Apply Changes.

---

## Scene timing

### Purpose

Control how long each scene's visuals and captions appear on screen.

### Manual duration editing

| Detail | Value |
|--------|-------|
| UI | Number input on `SceneCard` header |
| Range | 1–20 seconds |
| Fields set | `duration`, `durationMs`, `durationSource: "manual"` |
| Recalculation | `recalculateSceneTimings()` — cumulative `startMs` / `endMs` |
| Total | Story `totalDuration` = sum of scene durations |

### Initial timing (from generation)

Audio-first stories arrive with durations fitted to measured voiceover length via `attachEvenVoiceoverTiming()` — even split across scenes, `durationSource: "voiceover"`.

### Visual vs audio timing

Manual duration edits change **visual pacing only**. The voiceover MP3 is not re-stretched. During preview, narration plays at natural length while scene boundaries are visual. Export video length follows scene timing; FFmpeg muxes the narration track separately.

Timeline helper text states: *"Visual scenes do not change the narration."*

### Read-only narration window

Each `SceneCard` shows when narration plays during that scene's time window (`scene.start` – `scene.end`). This is context only — editing the window requires changing scene duration or order, not the narration text timing directly.

---

## Caption modes

### Purpose

Per-scene switch between static AI captions and narration-derived timed subtitles.

### Modes

| Mode | Value | On-screen source | Timing |
|------|-------|------------------|--------|
| **Generated** | `generated` | AI `subtitle` field | Static — full scene |
| **Subtitles** | `subtitles` | `subtitleText` | Timed chunks across scene |

Toggle: `CaptionModeControl` on each `SceneCard`.  
Default for new/legacy stories: **generated**.

### Mode switch behaviour

Switching to subtitles:

- Seeds `subtitleText` from narration excerpt if user has not set copy
- Does **not** overwrite existing `subtitleText`
- Enables subtitle effect controls

Switching to generated:

- Shows `subtitle` textarea
- Hides chunk-based subtitle editor
- Static caption for scene duration

Caption mode is **per-scene** — no story-wide default toggle in UI.

---

## Transitions

### Purpose

Add visual effects between scenes during the outgoing scene's final moments.

### Editor model

Transition cards (`TransitionCard`) sit **between scenes** in `timelineItems`. They are editor metadata — not AI-generated, never rendered as on-screen text in preview/export.

| Property | Options / behaviour |
|----------|---------------------|
| `effect` | cut, fade, slide-left, slide-right, zoom-in, zoom-out, blur |
| `durationMs` | 300, 500, 800, 1000 ms presets |
| Cap | ≤ 40% of outgoing scene duration |
| Default | fade, 500 ms |

### Render model

Transitions are **tail overlays** on the outgoing scene only:

- Do not extend total timeline duration
- Captions hidden during active overlay
- Shared resolver: `resolveSceneTransitionOverlay()`

Timeline copy: *"Transitions between scenes are visual only — no narration or media required."*

### State helper

`applyTransitionUpdate()` — patches effect/duration only; never modifies scenes or voiceover.

---

## Ken Burns (image motion)

### Purpose

Add slow zoom motion during scene playback on top of manual pan/zoom — documentary-style drift.

### Settings

Stored on `SceneImage.imageMotion`:

| Field | Options |
|-------|---------|
| `type` | `none`, `zoom-in`, `zoom-out` |
| `intensity` | `subtle` (→1.05×), `medium` (→1.10×), `strong` (→1.16×) |

UI: `SceneImageMotionControl` inside `SceneImageZoomControl` (visible when scene has an image).

### Behaviour

- Progress: linear 0→1 over scene duration (`resolveSceneImageMotionProgress`)
- Scale: multiplied on top of manual zoom (`resolveSceneImageMotionScale`)
- Applied in preview (`PreviewFrame`) and export (`video-render.service.ts`)
- Default when omitted: **none** / **subtle**

Ken Burns is playback-only — the editor shows a live preview when the scene is active.

---

## Current UX decisions

Design choices reflected in the current editor implementation:

### First draft, not final cut

Timeline helper copy explains that FootieBitz creates a first draft. Buffer scene buttons (Intro, Context, Transition, Ending) help creators pad structure without re-generating.

### Visual layer separated from narration

Scenes control **when** images and captions appear. They do not edit the narration script. This avoids accidental voiceover invalidation when restructuring the timeline.

### Scene activation syncs preview

Clicking or focusing a `SceneCard` calls `onActivate` → updates `selectedSceneIndex` in preview. Creators see framing and caption changes in context without hunting for the right scene.

### Storyboard layout over wizard steps

Post-generation editing uses a single workspace grid (draft + timeline + preview + export) rather than linear step-by-step gates. Story draft is collapsible (`<details open>`) to reduce scroll on mobile.

### Voice prefs vs voice audio

Voice and speed selectors apply immediately to **preferences**. Audio file replacement requires an explicit **Apply Changes** click — preventing surprise API calls and credit usage on every slider move.

### Fail-safe voiceover apply

If voiceover regeneration fails, the hook restores the full pre-request baseline (scenes, timings, audio URL) so a failed API call cannot leave the story in a partial state.

### Narration edit invalidates audio, not scenes

Changing narration text clears `voiceoverUrl` but preserves all scene edits. The user consciously re-applies voice when ready.

### Upload progress visibility

Timeline shows `Images uploaded: N/M` with a progress bar — nudging creators toward complete visual coverage before export without blocking export.

### Transition cards are invisible in output

Editor shows "Transition to next scene" label; preview/export render only the effect overlay. Creators understand transitions as post-production polish, not content scenes.

### No persistence UX yet

All edits live in React state. Refresh loses work. No save indicator — a known gap documented in [FUTURE.md](./FUTURE.md).

### Mobile affordances

- Compact footer controls on scene cards (move, duplicate, delete)
- Bottom action bar in workspace for quick preview/export navigation
- Touch drag supported on `SceneFrameImage`

---

## State management reference

| Helper | What it changes | What it preserves |
|--------|-----------------|-------------------|
| `applyStoryUpdate()` | Full story merge + sync | Voiceover if narration unchanged; clears audio if narration changed |
| `applySceneUpdate()` | One scene patch + timing recalc | Narration, voiceover, other scenes |
| `applyScenesUpdate()` | Full scene list | Narration, voiceover (unless explicitly changed) |
| `applySceneImageSettings()` | Image transform | URL, captions, timing content |
| `applyTransitionUpdate()` | Transition effect/duration | All scenes, narration, voiceover |
| `applyStoryVoiceSettings()` | Voice prefs only | Audio file, scenes, captions |
| `applyVoiceoverChanges()` | Audio + proportional timing refit | Scene content, captions, images, transitions |
| `syncFootieScript(next, prev)` | Normalization + timeline sync | User subtitle text, transition-only edits |

All paths flow through `page.tsx` → `handleStoryChange` → `applyStoryUpdate`.

---

## File reference

```
src/
├── components/
│   ├── StoryWorkspace.tsx       # Editor layout shell
│   ├── StoryReview.tsx          # Title + narration edit
│   ├── VoiceSettingsCard.tsx    # Voice/speed + Apply Changes
│   └── NarrationPanel.tsx       # Audio preview
├── features/editor/components/
│   ├── TimelineEditor.tsx       # Scene list + buffer inserts
│   ├── SceneCard.tsx            # Per-scene editing surface
│   ├── SceneFrameImage.tsx      # Pan drag preview
│   ├── SceneImageZoomControl.tsx
│   ├── SceneImageMotionControl.tsx
│   ├── CaptionModeControl.tsx
│   ├── SubtitleEffectControl.tsx
│   └── TransitionCard.tsx
├── hooks/
│   └── useStoryVoiceoverApply.ts
└── lib/
    └── voiceover.ts             # All apply* state helpers
```

---

## Related documentation

| Document | Contents |
|----------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Editing layer in system context |
| [GENERATION.md](./GENERATION.md) | What happens before editing |
| [DATA_MODEL.md](./DATA_MODEL.md) | `FootieScene`, `FootieScript` fields |
| [RENDERING.md](./RENDERING.md) | How edits appear in preview/export |
| [FEATURES.md](./FEATURES.md) | Feature-level status and limitations |
