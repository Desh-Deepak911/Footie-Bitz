# FootieBitz Roadmap

Phased product plan for FootieBitz — from today's browser studio to a full creator platform.

Goals describe **what creators gain**, not how we build it. For long-term vision, see [docs/FUTURE.md](./docs/FUTURE.md). For what ships today, see [docs/FEATURES.md](./docs/FEATURES.md).

---

## Completed

The core studio is live. Creators can go from a football topic to a finished vertical short entirely in the browser.

### Generation

- ✔ Script generation — AI-written documentary narration from a topic and tone
- ✔ Voiceover — spoken narration audio from the full script
- ✔ Voice speed — adjustable narrator pacing

### Editing

- ✔ Scene editor — add, delete, duplicate, reorder, and type scenes
- ✔ Image editor — upload, pan, zoom, and fit/fill per scene
- ✔ Subtitle modes — generated captions or timed narration subtitles
- ✔ Subtitle effects — fade-up, typewriter, and highlight animations
- ✔ Scene timing — manual duration control per scene
- ✔ Ken Burns — slow zoom motion during scene playback
- ✔ Scene transitions — visual effects between scenes

### Rendering

- ✔ Preview — interactive 9:16 playback with narration sync
- ✔ Export — downloadable vertical video at 720p–4K with optional narration

---

## Next

---

## Phase 1 — Projects and entry points

**Goal:** Creators can leave and return without losing work. FootieBitz feels like a product with a front door, not a single session.

- **Draft system** — every story saved as a named, retrievable project
- **Landing page** — clear value proposition and entry for new creators
- **`/editor/:draftId`** — deep-linkable editor for a specific project
- **`/create` page** — focused flow for starting a new short from a brief
- **Autosave** — continuous save so refresh, crash, or tab close never loses progress

**Outcome:** Creators build a library of works-in-progress and return to them across sessions and devices.

---

## Phase 2 — Generation improvements

**Goal:** First drafts are smarter, faster to trust, and easier to refine without starting over.

- **Targeted regeneration** — rewrite one scene or passage without rebuilding the whole story
- **Story templates** — recurring formats (match preview, player profile, rivalry piece) as starting points
- **Smarter pacing** — scene durations that follow narration rhythm, not even splits
- **Richer tone and audience control** — generation that understands who the short is for
- **Multiple takes** — save and compare generation versions before committing
- **Visual beat suggestions** — generation that hints at what to show, not just what to say
- **Clearer generation feedback** — creators always know what happened and what to do next
- **Wider voice choice** — more narrator options with preview before applying

**Outcome:** Generation feels like a creative partner that respects edits already made.

---

## Phase 3 — Editing improvements

**Goal:** The timeline becomes a true short-form editor — precise, fast, and forgiving.

- **Visual timeline** — drag-and-drop reorder, split, and merge on a ruler
- **Undo and redo** — full session history across all edits
- **Subtitle control** — manual chunk boundaries and word-level sync to voiceover
- **Caption style presets** — story-level fonts, colours, and animation defaults
- **Batch media workflow** — upload and assign images across many scenes at once
- **Brand kit** — logo, colours, and watermark applied consistently
- **Background music** — optional track with narration always leading
- **Multiple narration takes** — record or generate alternatives and compare
- **Re-fit to voiceover** — one-click recovery when visual pacing drifts from audio
- **Templates** — save and reuse story structures for recurring series

**Outcome:** Creators polish shorts with pro-editor confidence, not workarounds.

---

## Phase 4 — Rendering improvements

**Goal:** What you preview is what you publish — quickly, at any quality, for any platform.

- **Preview/export parity** — identical look between studio preview and final file
- **Full timeline scrubber** — navigate the whole short with thumbnails
- **Platform export presets** — one-click output tuned for TikTok, YouTube Shorts, and Reels
- **MP4 and broader format support** — outputs that upload everywhere without conversion
- **Cover frame picker** — choose the thumbnail from any moment in the timeline
- **Faster high-resolution export** — 4K without punishing everyday hardware
- **Partial export** — clip a scene range or teaser without rendering the full short
- **Richer motion and transitions** — expanded library beyond today's Ken Burns and overlays
- **Safe zone guides** — platform UI overlays so text and action stay visible
- **Shareable preview links** — send a review link before export

**Outcome:** Creators ship with confidence that the downloaded file matches what they approved.

---

## Phase 5 — Accounts, cloud, and publishing

**Goal:** FootieBitz becomes a daily production home — projects persist, teams collaborate, posts go live.

### Authentication

- Individual accounts with projects synced across devices
- Team and organisation accounts with roles and permissions
- Secure sign-in suitable for clubs and media outlets

### Cloud storage

- Durable media library — images and voiceover survive beyond a single browser session
- Central asset folders reusable across projects
- Reliable delivery for preview and export at any project size

### Publishing

- Direct publish to YouTube Shorts, TikTok, and Instagram Reels
- Schedule posts across time zones from one story
- Platform metadata pre-filled — title, description, tags, cover image
- Post-publish links back to the FootieBitz project for iteration and series follow-ups

**Outcome:** Creators move from idea to live post without leaving FootieBitz — solo or as a team.

---

## Phase overview

| Phase | Theme | Creator promise |
|-------|--------|-----------------|
| **Completed** | Core studio | Topic → narrated vertical short in one session |
| **Phase 1** | Projects | Come back tomorrow; your work is still here |
| **Phase 2** | Generation | Smarter first drafts; refine without restarting |
| **Phase 3** | Editing | Pro timeline control; story-first trust preserved |
| **Phase 4** | Rendering | Preview it, ship it — same result, any platform |
| **Phase 5** | Platform | Account, library, team, publish |

---

## Related documentation

| Document | Contents |
|----------|----------|
| [FUTURE.md](./docs/FUTURE.md) | Long-term product vision |
| [FEATURES.md](./docs/FEATURES.md) | Implemented capabilities today |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Current system design |
