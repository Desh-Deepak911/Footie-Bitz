# ShortForge Studio Roadmap

Phased plan from today's browser studio to a full creator platform.

**Product:** ShortForge Studio · **Creator watermark:** FootieBitz

For implemented capabilities see [docs/FEATURES.md](./docs/FEATURES.md). For long-term vision see [docs/FUTURE.md](./docs/FUTURE.md).

---

## v2.0 — Product Identity

**Goal:** ShortForge Studio reads as a creator platform, not a technical AI tool.

**Shipped / in progress:**

- ✔ Product rebrand — ShortForge Studio (UI, metadata, docs)
- ✔ Creator watermark — FootieBitz on preview and export only
- ✔ Staged creator workflow — Landing → Create → Research → Story → Narration → Storyboard → Editor → Export
- ✔ Navigation — Home, Create, Drafts, Documentation
- ✔ Consistent product language — Write, Create, Build, Edit, Preview, Download, Publish
- ✔ Landing page — cinematic hero, feature cards, documentation section
- ✔ Review route — `/create/review/[draftId]` for story, narration, and storyboard before the editor

**Outcome:** Creators understand the journey at a glance; internal architecture (`FootieScript`, API routes, pipeline stages) stays stable.

---

## v2.1 — UX Polish

**Goal:** The studio feels calm, fast, and trustworthy in daily use.

- **Autosave** — continuous draft persistence without manual Save Draft
- **Durable media** — voiceover and uploads that survive full page reload (IndexedDB or similar)
- **Loading and error copy** — clear, creator-friendly feedback at every step
- **Mobile polish** — sticky actions, touch targets, and review/editor layouts on small screens
- **Draft dashboard** — richer status chips, sorting, and resume hints
- **Empty states** — guided entry on create, drafts, and editor
- **Keyboard and focus** — accessible navigation through forms and timeline

**Outcome:** Creators pick up where they left off without thinking about storage or broken blob URLs.

---

## v2.2 — Football Intelligence

**Goal:** Research and story quality feel purpose-built for football content.

- **Smarter Smart Research** — richer match, player, and competition context with clearer Research Summary
- **Grounding QA** — fewer unsupported claims; better warnings when data is missing
- **Story templates** — match preview, player profile, top 5, recap formats as starting points
- **Ranking and stats** — reliable top-N and standings in research and story output
- **Targeted rewrite** — refresh narration or scenes without restarting the full flow
- **Research cache** — reuse preview results within a session to reduce API calls

**Outcome:** Football shorts start from facts creators can trust, not generic narration.

---

## v2.3 — Stability Sprint

**Goal:** Production confidence — regressions caught early, edge cases handled.

- **Verify coverage** — expand QA scripts for review flow, research grounding, export parity
- **Hydration and routing** — incomplete drafts always land on the correct route
- **Export reliability** — preview/export timing parity, narration drift warnings, format edge cases
- **Performance** — generation timeouts, streaming progress, large timeline responsiveness
- **Documentation sync** — ARCHITECTURE, GENERATION, and README stay aligned with code
- **Dependency hygiene** — lint, build, and typecheck clean on supported Node versions

**Outcome:** Ship-ready studio with predictable behaviour across browsers and brief types.

---

## v3 — Platform Expansion

**Goal:** ShortForge Studio becomes a daily production home — beyond one browser, with team and publish workflows.

### Authentication *(planned)*

- Individual accounts with projects synced across devices
- Team and organisation accounts with roles

### Cloud storage *(planned)*

- Cloud-backed drafts tied to accounts
- Durable media library — images and voiceover survive beyond a single session
- Asset folders reusable across projects

### Publishing

- Direct publish to YouTube Shorts, TikTok, and Instagram Reels
- Schedule posts and platform metadata (title, description, cover)
- Post-publish links back to the studio project

### Platform features

- Series and templates across projects
- Collaboration — review links, comments, approval
- Analytics hooks — export and publish history

**Outcome:** Creators move from idea to live post without leaving ShortForge Studio — solo or as a team.

---

## Version overview

| Version | Theme | Creator promise |
|---------|--------|-----------------|
| **v2.0** | Product Identity | Clear brand, language, and staged workflow |
| **v2.1** | UX Polish | Autosave, durable media, polished daily use |
| **v2.2** | Football Intelligence | Research and stories built for football |
| **v2.3** | Stability Sprint | Reliable, tested, documented |
| **v3** | Platform Expansion | Accounts, cloud drafts, publish |

---

## Related documentation

| Document | Contents |
|----------|----------|
| [README.md](./README.md) | Overview, workflow, routes, tech stack |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System layers and data flow |
| [docs/FEATURES.md](./docs/FEATURES.md) | Implemented capabilities today |
| [docs/FUTURE.md](./docs/FUTURE.md) | Long-term product vision |
