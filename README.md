# ShortForge Studio

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AI-powered storytelling platform for creating research-backed short-form videos.**

ShortForge Studio helps creators turn a simple idea into a fully edited, narrated short-form video — without a traditional editing suite. Write a brief, gather supporting research, generate a grounded script, review and refine the narration, build timed scenes, edit on a timeline, preview in the browser, and export production-ready video.

The platform is built around one principle: **the story drives everything else.** Narration is written and spoken before scenes are planned, so timing follows the voice.

Exported videos carry a **FootieBitz** watermark (creator/channel branding). The product name is **ShortForge Studio**.

---

## Interface

<img width="2442" height="1656" alt="image" src="https://github.com/user-attachments/assets/ba96dbbf-c0a7-44e4-8b35-a82efea56090" />

<img width="2448" height="1650" alt="image" src="https://github.com/user-attachments/assets/e9283aaf-672d-49e7-8b5c-2141c4f769e3" />

<img width="2410" height="1698" alt="image" src="https://github.com/user-attachments/assets/868eaded-3ac4-43b5-93ee-07beaf2b6119" />


## Table of Contents

- [Features](#features)
- [Story Creation Pipeline](#story-creation-pipeline)
- [Intelligence Runtime](#intelligence-runtime)
- [Timeline Intelligence Runtime](#timeline-intelligence-runtime)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Current Capabilities](#current-capabilities)
- [Documentation](#documentation)
- [Why ShortForge Studio](#why-shortforge-studio)
- [Getting Started](#getting-started)
- [License](#license)

---

## Features

### Story Creation

- **AI script generation** — Documentary-style narration from topic, tone, duration, and story mode
- **Storytelling modes** — Story, tactical review, match preview/recap, player analysis, top 5, historical explainer, and opinion/debate
- **Research-backed content** — Smart Research and Research Preview gather verified football context before writing
- **Script review** — Edit title and narration on a dedicated review screen before audio production
- **Voiceover** — Natural TTS with voice and speed controls
- **Scene generation** — Audio-first storyboards timed to measured narration

### Editing Studio

- **Timeline editor** — Arrange scenes, captions, and transitions on a vertical 9:16 canvas
- **Scene management** — Add, reorder, and refine individual scenes
- **Image positioning** — Pan, zoom, and Ken Burns motion per scene
- **Background music** — Optional bed with volume control in preview and export
- **Voiceover controls** — Regenerate narration and adjust playback speed
- **Subtitle synchronization** — Captions aligned to narration timing with completion guard for final lines
- **Caption effects** — Fade-up, typewriter, and highlight animations scheduled on the master clock
- **Live preview** — Interactive device-frame playback synced to audio via shared timeline authority

### Export

- **Browser rendering** — Client-side compositing; no server-side video farm
- **WebM export** — In-browser capture via MediaRecorder
- **MP4 export** — High-quality muxing via FFmpeg.wasm
- **Audio synchronization** — Voiceover and background music mixed in the final file
- **Preview/export parity** — WebM and MP4 exports use the same Master Timeline as live preview
- **Draft persistence** — Save and reload work across sessions (browser localStorage)

---

## Story Creation Pipeline

The creator-facing workflow from brief to download:

```
Create
  ↓
Review
  ↓
Voiceover
  ↓
Scene Generation
  ↓
Editor
  ↓
Preview
  ↓
Export
```

| Stage | What happens |
|-------|----------------|
| **Create** | Enter a topic, story mode, tone, duration, and optional notes. Smart Research and Research Preview run the Intelligence Runtime when enabled. |
| **Review** | Edit title and narration, confirm the script, and prepare for audio production. |
| **Voiceover** | OpenAI TTS generates narration; measured duration drives all downstream timing. |
| **Scene Generation** | Scenes, captions, and transitions are planned against the voiceover (audio-first). |
| **Editor** | Refine scenes, images, motion, music, and captions on the timeline. |
| **Preview** | Live 9:16 playback validates timing, subtitles, and audio mix. |
| **Export** | Canvas rendering and FFmpeg.wasm produce downloadable WebM or MP4. |

For the full system path including research and rendering, see [ARCHITECTURE.md](./ARCHITECTURE.md#high-level-flow).

---

## Intelligence Runtime

ShortForge Studio is not a single prompt to an LLM. Research, reasoning, and story planning run in structured layers before script generation.

```
User Brief
  ↓
Intent Engine
  ↓
Entity Resolver
  ↓
Competition Resolver
  ↓
Query Orchestrator
  ↓
Provider Registry
  ↓
  ├── API Football
  ├── Static Knowledge
  └── Future Providers
  ↓
Canonical Research Bundle
  ↓
Knowledge Graph
  ↓
Graph Context
  ↓
Prompt Intelligence
  ↓
OpenAI
```

| Layer | Purpose |
|-------|---------|
| **User Brief** | Topic, story mode, tone, duration, and optional creator notes. |
| **Intent Engine** | Classifies story type (preview, recap, ranking, player focus, opinion, etc.). |
| **Entity Resolver** | Identifies players, teams, and competitions referenced in the brief. |
| **Competition Resolver** | Maps competitions and seasons to provider-ready identifiers. |
| **Query Orchestrator** | Plans research calls, order, and fallbacks. |
| **Provider Registry** | Routes calls to registered backends with diagnostics. |
| **API Football** | Live fixtures, statistics, rankings, and player data. |
| **Static Knowledge** | Curated fallback when live providers return sparse results. |
| **Canonical Research Bundle** | Normalized merge of provider results with provenance. |
| **Knowledge Graph** | Facts, entities, and relationships with confidence metadata. |
| **Graph Context** | Mode-aware research context — ranked facts, entities, grounding rules, warnings. |
| **Prompt Intelligence** | Narrative plan, fact selection, and production prompt text for the LLM. |
| **OpenAI** | Generates narration from structured context — not raw provider JSON. |

Prompt Intelligence is the **primary** production prompt path. Graph Context text is used as a **fallback** when Prompt Intelligence cannot produce a valid prompt.

Deep dive: [ARCHITECTURE.md — Intelligence Runtime](./ARCHITECTURE.md#intelligence-runtime)

---

## Timeline Intelligence Runtime

Preview and export share one **Master Timeline** — an absolute-timestamp model that keeps scene, subtitle, caption animation, image motion, transition, and audio clocks aligned from editor through download.

```
FootieScript
  ↓
buildMasterTimeline()
  ↓
optimizeMasterTimeline()
  ↓
  ├── Scene track
  ├── Subtitle track
  ├── Caption-animation track
  ├── Image-motion track
  ├── Transition track
  └── Audio track
  ↓
Preview playback · Export frame loop · FFmpeg mux
```

| Capability | Purpose |
|------------|---------|
| **Master Timeline** | Single canonical clock for every timed event in preview and export. |
| **Absolute timestamp model** | All events use `startMs` / `endMs` on one master clock — no per-pipeline drift. |
| **Shared preview/export timing** | Preview and export resolve the same scene, subtitle, and animation at the same `timeMs`. |
| **Render duration authority** | `renderDurationMs` spans audio, narration, scenes, subtitles, animations, and transitions. |
| **Subtitle completion guard** | Final subtitle lines hold through render end so narration does not cut off early. |
| **Caption animation scheduler** | Fade-up, highlight, and typewriter effects paced inside subtitle windows. |
| **Typewriter timing** | Character reveal respects available duration; short windows accelerate safely. |
| **Image motion scheduler** | Pan, zoom, and Ken Burns presets driven by timeline events, not ad hoc per frame. |
| **Transition scheduler** | Scene-tail overlays (fade, slide, zoom, blur) clamped to safe outgoing duration. |
| **Timeline optimizer** | Pre-render pass clamps animation/transition tails and flags dense or short scenes. |
| **Drift correction** | Export preflight refits scenes to voiceover; optimizer preserves audio alignment. |
| **WebM/MP4 export sync** | Mux duration follows Master Timeline render span; voiceover remains primary authority. |

Shipped in **v2.6.0 — Timeline Intelligence Runtime**. Deep dive: [ARCHITECTURE.md — Timeline Intelligence Runtime](./ARCHITECTURE.md#timeline-intelligence-runtime)

---

## Technology Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Lucide React |
| **AI** | OpenAI (script + TTS), Prompt Intelligence, Knowledge Graph, Entity Resolution, Intent Engine |
| **Media** | FFmpeg.wasm, Web Audio API, HTML Canvas |
| **Research** | API Football, Static Knowledge Provider |
| **Infrastructure** | Vercel, TypeScript, ESLint |

---

## Project Structure

```
footiebitz/
├── src/
│   ├── app/                    # Routes: landing, create, review, editor, drafts, API
│   ├── components/             # Shell, landing, shared UI
│   ├── features/
│   │   ├── create/             # Brief, Research Preview, script review
│   │   ├── intelligence/       # Intent, entities, orchestrator, Knowledge Graph, Prompt Intelligence
│   │   ├── research/           # Research context and script integration
│   │   ├── story/              # Script types, generation, timing
│   │   ├── editor/             # Timeline, scenes, captions, transitions
│   │   ├── preview/            # Device-frame playback
│   │   ├── timeline-intelligence/  # Master Timeline, schedulers, optimizer
│   │   ├── export/             # Canvas render, FFmpeg mux, audio mix
│   │   └── drafts/             # Draft model and localStorage persistence
│   ├── lib/                    # Shared utilities and verify scripts
│   └── types/                  # Shared API and domain types
├── ARCHITECTURE.md
├── CHANGELOG.md
├── ROADMAP.md
└── README.md
```

---

## Current Capabilities

ShortForge Studio ships a production-ready creator workflow for football short-form video:

- **Multi-stage story creation** — Create → Review → Voiceover → Scene Generation → Editor → Preview → Export
- **Research-backed scripts** — Intelligence Runtime feeds Prompt Intelligence before LLM generation
- **Timeline Intelligence Runtime** — Master Timeline with shared preview/export timing, schedulers, and optimizer (v2.6.0)
- **Timeline editing** — Scenes, images, captions, transitions, and Ken Burns motion
- **Voiceover and background music** — TTS with regeneration; optional music bed in preview and export
- **Draft persistence** — Save, list, open, and delete drafts in the browser
- **Browser rendering** — MP4 (FFmpeg.wasm) and WebM (MediaRecorder); aligned to Master Timeline render duration

Latest release: **v2.6.0 — Timeline Intelligence Runtime** · [CHANGELOG.md](./CHANGELOG.md) · Planned work: [ROADMAP.md](./ROADMAP.md)

---

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Product overview, features, and getting started |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, pipelines, and design principles |
| [ROADMAP.md](./ROADMAP.md) | Completed, in-progress, and planned product work |
| [CHANGELOG.md](./CHANGELOG.md) | Version history ([Keep a Changelog](https://keepachangelog.com/)) |

Additional implementation notes live in [`docs/`](./docs/).

---

## Why ShortForge Studio

This is not a thin wrapper around a chat completion. ShortForge Studio runs a **structured Intelligence Runtime** — from intent classification and entity resolution through Knowledge Graph assembly, Graph Context, and Prompt Intelligence — before a single word of narration is generated.

The platform performs **research**, **reasoning**, **story planning**, **script generation**, **voiceover**, **scene generation**, **editing**, and **rendering** as distinct stages. Grounding rules and forbidden claims prevent invented stats from reaching the script.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

```bash
git clone https://github.com/your-username/footiebitz.git
cd footiebitz
npm install
```

Create `.env.local`:

```env
OPENAI_API_KEY=sk-...
API_FOOTBALL_KEY=...   # optional — enables Smart Research
```

### Run

```bash
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

Deploy to [Vercel](https://vercel.com) with environment variables configured. Export runs entirely in the browser.

---

## License

MIT
