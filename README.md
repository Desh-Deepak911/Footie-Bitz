# ShortForge Studio

**Product:** [ShortForge Studio](#overview) — a creator platform for cinematic short-form football videos.

**Creator watermark:** Exported and previewed videos carry a **FootieBitz** watermark (the creator/channel brand). The app UI and metadata use ShortForge Studio.

---

## Overview

ShortForge Studio turns ideas, events, and research into polished 9:16 shorts. Creators write stories, create narration, build storyboards, edit scenes in a timeline, preview in the browser, and download production-ready video — without a traditional editing suite.

The product is built around one principle: **the story drives everything else.** Narration is written and spoken before scenes are planned, so timing follows the voice — not the other way around.

Drafts persist in **localStorage** (browser-only MVP). Use **Save Draft** in the editor to keep work across sessions on the same device.

---

## Features

| Area | What creators get |
|------|-------------------|
| **Research** | Smart Research and Research Preview — supporting facts gathered before writing |
| **Story** | Documentary-style narration from topic, tone, duration, and story type |
| **Narration** | Natural voiceovers with voice and speed controls |
| **Storyboard** | Timed scenes built from reviewed copy and measured narration |
| **Editor** | Timeline — scenes, images, captions, transitions, Ken Burns motion |
| **Preview** | Interactive 9:16 playback synced to narration |
| **Export** | Client-side MP4 (and optional WebM) with mixed narration and background music |
| **Drafts** | Dashboard to list, open, and delete saved stories in this browser |

---

## Workflow

### Current workflow

```
Landing
  ↓
Create
  ↓
Research
  ↓
Story
  ↓
Narration
  ↓
Storyboard
  ↓
Editor
  ↓
Export
```

| Step | Where it happens | What happens |
|------|------------------|--------------|
| **Landing** | `/` | Product overview, feature cards, links to create or drafts |
| **Create** | `/create` | Brief — topic, story type, tone, duration, quality, Smart Research |
| **Research** | `/create` | Optional preview via `POST /api/research-football` before writing |
| **Story** | `/create` → `/create/review/[draftId]` | Write story (`script-only` generation), then edit title and narration |
| **Narration** | `/create/review/[draftId]` | Create narration via `POST /api/generate-voiceover` |
| **Storyboard** | `/create/review/[draftId]` | Build storyboard (`scenes-only` generation) timed to narration |
| **Editor** | `/editor/[draftId]` | Refine timeline, images, captions, transitions; preview |
| **Export** | `/editor/[draftId]` | Download production-ready video from the browser |

Incomplete drafts (no storyboard yet) open on the **review** route. Editor-ready drafts open on **`/editor/[draftId]`**.

---

## Architecture

ShortForge Studio is a Next.js App Router application organized into **product routes**, **feature modules**, and **shared services**. Internal names (`FootieScript`, `generate-script`, `StoryDocumentStore`, pipeline stages) are unchanged in code.

```
┌─────────────────────────────────────────────────────────────┐
│  Product shell (pages + layout)                             │
│  Landing · Create · Review · Editor · Drafts                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Client features                                            │
│  create/ · drafts/ · editor/ · preview/ · export/ · research/│
└──────────────────────────┬──────────────────────────────────┘
                           │ FootieScript + Draft model
┌──────────────────────────▼──────────────────────────────────┐
│  Server API routes (Node.js)                                │
│  /api/generate-script · /api/generate-voiceover               │
│  /api/research-football                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    OpenAI + API-Football
```

| Layer | Responsibility |
|-------|----------------|
| **Product shell** | `LandingPage`, `CreateStoryFlow`, `ScriptReviewFlow`, `DraftEditorFlow`, navigation |
| **Drafts** | `StoryDocumentStore`, localStorage persistence, pipeline routing (`script_review` → `voiceover_ready` → `editor_ready`) |
| **Generation** | Audio-first services — script, voiceover, scene planning (server) |
| **Editing** | Timeline, scene cards, captions, images, transitions (client) |
| **Rendering** | Preview playback and canvas export (client) |

**Data model:** `FootieScript` holds title, narration, scenes, timeline items, voiceover, voice/export/background settings. Drafts wrap `FootieScript` with metadata and a `pipelineStage`.

**Generation modes** (`POST /api/generate-script`): `script-only` (create flow), `scenes-only` (review flow storyboard), `full` (legacy one-shot).

Deeper reading: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) · [`docs/GENERATION.md`](./docs/GENERATION.md) · [`docs/EDITING.md`](./docs/EDITING.md) · [`docs/RENDERING.md`](./docs/RENDERING.md)

### Repository layout

```
footiebitz/
├── src/
│   ├── app/                          # App Router pages + API routes
│   │   ├── page.tsx                  # Landing (/)
│   │   ├── create/                   # Create + review routes
│   │   ├── editor/[draftId]/         # Editor
│   │   ├── drafts/                   # Draft dashboard
│   │   └── api/
│   │       ├── generate-script/
│   │       ├── generate-voiceover/
│   │       └── research-football/
│   ├── components/                   # Shell, landing, composer, workspace
│   ├── features/
│   │   ├── create/                   # Create + ScriptReviewFlow
│   │   ├── drafts/                   # Draft model, storage, StoryDocumentStore
│   │   ├── research/                 # Football research + grounding
│   │   ├── story/                    # Types, timing, generation services
│   │   ├── editor/                   # Timeline, scene cards, controls
│   │   ├── preview/                  # Playback and device frame
│   │   └── export/                   # Canvas render and FFmpeg mux
│   ├── lib/                          # AI prompts, voiceover sync, verify tests
│   └── types/                        # Shared API types (footiebitz.ts)
├── docs/
├── README.md
└── ROADMAP.md
```

---

## Routes

| Route | Purpose |
|-------|---------|
| **`/`** | Landing — hero, features, documentation anchor, CTAs |
| **`/create`** | Create — brief, Smart Research, Write Story |
| **`/create/review/[draftId]`** | Story review — edit copy, narration, build storyboard |
| **`/editor/[draftId]`** | Editor — timeline, preview, export, Save Draft |
| **`/drafts`** | Draft dashboard — list, open, delete (local browser) |

| API route | Purpose |
|-----------|---------|
| **`POST /api/generate-script`** | Script-only, scenes-only, or full audio-first generation |
| **`POST /api/generate-voiceover`** | Narration audio from current script |
| **`POST /api/research-football`** | Research Preview / Smart Research context |

**Draft persistence:** localStorage key `footiebitz:drafts:v1`. No cloud sync or sign-in yet.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Lucide React |
| AI | OpenAI Responses API, OpenAI TTS (`tts-1`) |
| Research | API-Football (server-side), grounding utilities |
| Preview | React, CSS animations |
| Export | HTML5 Canvas 2D, MediaRecorder, FFmpeg.wasm |
| Deployment | Vercel-compatible serverless routes |

---

## Roadmap

| Version | Theme |
|---------|--------|
| **v2.0** | Product Identity |
| **v2.1** | UX Polish |
| **v2.2** | Football Intelligence |
| **v2.3** | Stability Sprint |
| **v3** | Platform Expansion |

Details: [ROADMAP.md](./ROADMAP.md) · Long-term vision: [docs/FUTURE.md](./docs/FUTURE.md)

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
| `API_FOOTBALL_KEY` | No | API-Football key for Smart Research (when enabled) |

Example:

```env
OPENAI_API_KEY=sk-...
```

---

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or go to [http://localhost:3000/create](http://localhost:3000/create).

```bash
npm run lint
npm run build
```

Regression checks live in `package.json` (`test:*` scripts). Common smoke tests:

```bash
npm run test:script-review-workflow
npm run test:drafts
npm run test:audio-first-qa
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) or any Node.js host supporting Next.js App Router.

1. Connect the repository.
2. Set `OPENAI_API_KEY` (and optional research keys) in environment variables.
3. Deploy. Generation routes use the Node.js runtime with extended timeout.

Export runs entirely in the browser — no server-side video rendering required.

---

## Contributing

ShortForge Studio is organized by feature domains (`create`, `drafts`, `story`, `editor`, `preview`, `export`, `research`). Preview and export share timing and caption logic to stay aligned.

When proposing a change:

1. Describe the **creator problem** being solved.
2. Identify the affected layer — generation, editing, or rendering.
3. Note whether voiceover or scene timing must stay unchanged.
4. Run relevant verify scripts and `npm run build`.

Start with [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system context.

---

## License

MIT
