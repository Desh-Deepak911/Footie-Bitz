# FootieBitz

**An AI-powered platform for creating football documentary shorts.**

FootieBitz turns a topic into a narrated vertical video — from script and voiceover to timed scenes, visual editing, preview, and export. Built for creators who want story-first short-form production without a traditional editing suite.

---

## Project Overview

FootieBitz is a modern web application for producing 9:16 football shorts. Enter a brief, and the platform generates a complete documentary narration, synthesizes voiceover audio, and plans a timed scene breakdown. Creators refine the result in a production timeline — editing copy, uploading images, adjusting captions, and applying transitions — then preview and export a finished video entirely in the browser.

The product is built around one principle: **the story drives everything else.** Narration is written and spoken before scenes are planned, so timing follows the voice — not the other way around.

---

## Features

### AI generation

- Documentary-style script generation from topic, tone, and duration
- Audio-first pipeline: narration → voiceover → scene plan timed to measured audio
- Configurable scene count, quality tier, and streaming generation progress
- OpenAI text-to-speech with voice and speed control

### Production timeline

- Scene editor — add, delete, duplicate, reorder, and type scenes
- Manual scene duration (1–20 seconds) with live total timeline update
- Buffer scene types: Intro, Context, Match, Transition, Ending
- Scene-to-scene transitions: cut, fade, slide, zoom, blur

### Captions and subtitles

- **Generated captions** — static AI subtitle per scene
- **Timed subtitles** — narration-derived chunks with even pacing
- Subtitle effects: fade-up, typewriter, highlight
- Up to three visible lines, bottom-centred content-sized pill

### Visual editing

- Per-scene image upload with pan, zoom, and fit/fill framing
- Ken Burns motion — subtle, medium, or strong zoom during playback
- Type-labelled placeholders when no image is uploaded
- Touch-friendly image positioning

### Preview and export

- Interactive 9:16 preview with narration-synced playback
- Client-side export at 720p, 1080p, 1440p, or 4K vertical
- Optional narration track muxed into final WebM
- Preview and export share timing, subtitle, transition, and motion logic

---

## Architecture

FootieBitz is organized into three layers that share a common story model (`FootieScript`):

| Layer | Responsibility |
|-------|----------------|
| **Generation** | AI script, voiceover, and scene planning (server) |
| **Editing** | Timeline, captions, images, transitions (client) |
| **Rendering** | Preview playback and canvas export (client) |

AI generation runs on server API routes. Editing, preview, and export run in the browser. Detailed documentation lives in [`docs/`](./docs/).

---

## Screenshots

> Screenshots coming soon.

| Screen | Description |
|--------|-------------|
| Story Brief | Topic input, tone, duration, and generation controls |
| Production Timeline | Scene cards with image, caption, and timing controls |
| Preview | Vertical phone-frame playback with subtitles |
| Export | Quality presets and download |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Lucide React |
| AI | OpenAI Responses API, OpenAI TTS (`tts-1`) |
| Preview | React, CSS animations |
| Export | HTML5 Canvas 2D, MediaRecorder, FFmpeg.wasm |
| Deployment | Vercel-compatible serverless routes |

---

## How It Works

```
Prompt → Script → Voiceover → Scene plan → Editor → Preview → Export
```

1. **Brief** — Creator enters a football topic, tone, duration, and scene count.
2. **Script** — AI writes a continuous documentary narration.
3. **Voiceover** — Text-to-speech produces narration audio; duration becomes the timing authority.
4. **Scene plan** — AI designs visual beats (subtitles, scene types) mapped to the voiceover.
5. **Editor** — Creator refines narration, scenes, images, captions, and transitions. All edits are local and non-destructive until voiceover is explicitly regenerated.
6. **Preview** — Full vertical short plays in the browser, synced to narration.
7. **Export** — Canvas renders each frame; optional FFmpeg mux adds narration audio. Download as WebM.

---

## Installation

### Prerequisites

- Node.js 18 or later
- npm
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Clone and install

```bash
git clone https://github.com/your-username/footiebitz.git
cd footiebitz
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for script generation and TTS |
| `OPENAI_SCRIPT_MODEL` | No | Override the default model for all quality tiers |

Example:

```env
OPENAI_API_KEY=sk-...
```

Optional override:

```env
OPENAI_SCRIPT_MODEL=gpt-4.1-mini
```

---

## Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Run the linter:

```bash
npm run lint
```

Run regression verification scripts:

```bash
npm run test:export-subtitle-qa
npm run test:transition-qa
npm run test:audio-first-qa
npm run build
```

See `package.json` for the full list of verify scripts.

---

## Build

Create a production build:

```bash
npm run build
```

Serve the production build locally:

```bash
npm run start
```

---

## Deployment

FootieBitz deploys cleanly to [Vercel](https://vercel.com) or any Node.js host that supports Next.js App Router.

1. Connect the repository to your deployment platform.
2. Set `OPENAI_API_KEY` in the environment variables panel.
3. Deploy. API routes use the Node.js runtime with a 120-second generation timeout.

Client-side export requires a modern browser with Canvas, MediaRecorder, and WebAssembly support. No server-side video rendering is needed.

---

## Current Architecture

```
footiebitz/
├── src/
│   ├── app/                      # Pages and API routes
│   │   ├── page.tsx              # Studio
│   │   ├── api/generate-script/
│   │   └── api/generate-voiceover/
│   ├── components/               # Studio shell and panels
│   ├── features/
│   │   ├── story/                # Types, timing, generation services
│   │   ├── editor/               # Timeline, scene cards, controls
│   │   ├── preview/              # Playback and device frame
│   │   └── export/               # Canvas render and FFmpeg mux
│   ├── lib/                      # AI prompts, voiceover sync, tests
│   └── types/                    # API request/response types
├── docs/                         # Architecture and feature docs
├── README.md
└── ROADMAP.md
```

**Data flow:** `FootieScript` holds title, narration, scenes, timeline items, voiceover URL, and voice settings. All editor changes flow through immutable update helpers and `syncFootieScript()` normalization before reaching preview or export.

**Server boundary:** OpenAI calls and API keys stay on the server. Preview, export, and image blobs run entirely in the browser.

For deeper reading:

| Document | Contents |
|----------|----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System layers and data flow |
| [docs/GENERATION.md](./docs/GENERATION.md) | Audio-first pipeline |
| [docs/EDITING.md](./docs/EDITING.md) | Editor philosophy and controls |
| [docs/RENDERING.md](./docs/RENDERING.md) | Preview vs export |
| [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) | Story, scene, and timeline types |
| [docs/FEATURES.md](./docs/FEATURES.md) | Feature reference |

---

## Roadmap

Development is phased from core studio toward projects, deeper editing, rendering polish, and platform features (accounts, cloud storage, publishing).

| Phase | Focus |
|-------|--------|
| **Completed** | Generation, editing, preview, export |
| **Phase 1** | Draft system, landing page, `/create`, `/editor/:draftId`, autosave |
| **Phase 2** | Generation improvements |
| **Phase 3** | Editing improvements |
| **Phase 4** | Rendering improvements |
| **Phase 5** | Authentication, cloud storage, publishing |

Full detail: [ROADMAP.md](./ROADMAP.md) · Long-term vision: [docs/FUTURE.md](./docs/FUTURE.md)

---

## Contributing

Contributions are welcome. FootieBitz is structured around feature domains (`story`, `editor`, `preview`, `export`) with shared utilities keeping preview and export behaviour aligned.

When proposing a change:

1. Describe the **creator problem** being solved.
2. Identify which layer is affected — generation, editing, or rendering.
3. Note whether voiceover or scene timing behaviour must stay unchanged.
4. Run relevant verify scripts and `npm run build` before opening a pull request.

For architectural context, start with [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## License

MIT
