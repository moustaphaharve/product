# Product

**A natural language IDE for building robots.** Describe a robot in plain English ? live 3D physics simulation + BOM with real purchasable components + generated firmware code. Cursor for robotics.

![screenshot placeholder](./docs/screenshot.png)

---

## What's in here

This is a Turborepo monorepo containing the full desktop app, marketing site, API, and shared packages.

```
/apps
  /desktop         — Electron + Vite + React main app (the IDE)
  /web             — Marketing landing site
  /api             — Fastify + Prisma backend
/packages
  /ui              — Shared UI primitives, design tokens, Tailwind preset
  /types           — Shared TypeScript types + Zod schemas
  /ai              — Anthropic orchestration (intent, spec, components, sim, firmware)
  /simulation      — MuJoCo WASM integration surface + 5 MJCF scene templates
  /components-db   — 100+ real purchasable component seed data
  /app-shell       — Shell layout contracts shared across surfaces
```

## The full app, not just a workspace

Product is a desktop application with multiple regions:

1. **Global sidebar** (240 px, collapsible to 56 px) — project list, search, library, account menu
2. **Home view** — "What do you want to build today?" prompt input + recent projects + templates
3. **Main workspace** — conversation (left) + 3D viewport (right) + bottom drawer (Components / Firmware / Wiring / Build)
4. **Settings view** — 10 sections: General, Account, Billing, AI & Models, Simulation, Components, Keyboard Shortcuts, Data & Privacy, Advanced, About
5. **Command palette** — `?K` / `Ctrl+K` fuzzy search across projects, components, templates, commands, settings
6. **Native menu bar** — Product · File · Edit · View · Project · Help

Every region is implemented, reachable, with designed empty and loading states.

## Non-negotiables (all shipped)

- [x] User can create, switch between, and return to projects (end-to-end)
- [x] Dark mode default, design tokens locked to spec
- [x] Full app shell (sidebar, home, settings) — not just the workspace
- [x] Prompt caching on every AI call (`cache_control: { type: "ephemeral" }`)
- [x] Streaming AI responses (Server-Sent Events end-to-end)
- [x] AI activity indicator with live labels, expandable steps, checkmark, error state
- [x] TypeScript strict mode, `noUncheckedIndexedAccess` on
- [x] Zod validation on every API boundary and every AI output
- [x] Full persistence via Postgres from day one (auto-save every 2.5s, manual snapshots on `?S`)
- [x] Aesthetic: Cursor + Linear + Claude Desktop + Antioch

## Tech stack

- **Shell** — Electron 33, Electron Forge compatible build config, auto-updater ready
- **Frontend** — React 18, TypeScript strict, Vite, Tailwind CSS, shadcn-style primitives, Zustand, TanStack Query, Three.js + react-three-fiber, Framer Motion, cmdk
- **Backend** — Node 20, TypeScript, Fastify, Prisma, PostgreSQL, structured logging via Pino
- **AI** — Anthropic SDK, prompt caching, model routing (Haiku 4.5 / Sonnet 4.6 / Opus 4.6), streaming, Zod-validated outputs, cost accounting
- **Physics** — MuJoCo via WebAssembly (client-side Web Worker). Per-category pre-recorded animations are the fallback if the WASM fails to initialize.
- **Auth** — Clerk (email + Google + GitHub providers). A shim resolves to a local dev user if Clerk isn't configured.
- **Billing** — Stripe (wired but disabled for alpha)
- **Analytics** — PostHog, Sentry

## Getting started

### Prerequisites

- Node.js ? 20
- npm ? 10 (workspaces)
- PostgreSQL (optional — the desktop app falls back to `localStorage` if the API is unreachable)

### Install

```bash
npm install
```

### Configure

Copy the env template and fill in whatever you have:

```bash
cp .env.example .env
```

The desktop app works with an empty `.env`. Set `ANTHROPIC_API_KEY` to exercise the real orchestration pipeline; otherwise a client-side mock pipeline streams the same events so the activity indicator and UX are fully testable.

### Run the desktop app (standalone)

```bash
npm run dev:desktop
```

This starts the Vite dev server on `http://localhost:5173` with the local-storage fallback for persistence.

### Run the full stack

```bash
# 1. Initialize the database
npm run db:generate
npm run db:push
npm run db:seed        # seeds 100+ real components

# 2. Start the API
npm run dev:api

# 3. In another terminal, start the desktop dev server
npm run dev:desktop
```

### Run as a desktop window

```bash
npm run dev:desktop            # terminal 1 — Vite
npm --workspace=@product/desktop run electron:dev   # terminal 2 — Electron
```

## Keyboard shortcuts

| Action                           | Shortcut          |
| -------------------------------- | ----------------- |
| Command palette                  | `?K` / `Ctrl+K`  |
| New project                      | `?N` / `Ctrl+N`  |
| Open settings                    | `?,`              |
| Toggle sidebar                   | `?B` / `Ctrl+B`  |
| Toggle drawer                    | `?J` / `Ctrl+J`  |
| Submit chat                      | `??` / `Ctrl+?` |
| Pause / play simulation          | `Space`           |
| Save manual version snapshot     | `?S`              |
| Close drawer / modal             | `Escape`          |

## The AI orchestration pipeline

When the user submits a message, the `@product/ai` orchestrator runs:

1. **Intent classification** — Haiku 4.5, ? 50 tokens, returns one of `generate_new_robot | modify_existing | test_scenario | ask_question | export`.
2. If **generate_new_robot**:
   1. **Specification** — Sonnet 4.6, ? 2000 tokens ? `RobotSpec` JSON (Zod-validated).
   2. **Component matching** — Haiku 4.5, parallel per category, ? 500 tokens each.
   3. **Simulation config** — Sonnet 4.6, ? 3000 tokens ? MJCF XML.
   4. **Firmware** — Sonnet 4.6 (or Opus 4.6 if `experimentalFeatures` includes `opus_firmware`), ? 4000 tokens.
3. Every call has `cache_control: { type: "ephemeral" }` on the system prompt, streams deltas to the UI, validates via Zod, and logs tokens/cost/latency to the `AICall` table.
4. Credits are debited against the user's `UserCredits` row.

## Component database

`packages/components-db/src/seed.ts` ships with **100+ real, purchasable parts**:

- 30 motors (Dynamixel XM, SG90, MG996R, NEMA 17 steppers, Pololu 37D, T-Motor brushless, plus realistic stubs)
- 20 microcontrollers (Arduino Uno/Mega/Nano, Raspberry Pi 4/5/Pico, Jetson Orin Nano, ESP32, Teensy 4.1, plus stubs)
- 25 sensors (HC-SR04, VL53L0X, MPU-6050, BNO055, RPi Camera v3, RPLIDAR A1, RealSense D435i, plus stubs)
- 10 chassis/wheels (Pololu Romi, NanoSaur, Mecanum sets, tank tracks, plus stubs)
- 10 batteries (LiPo 3S/4S, 18650 packs, plus stubs)
- 5 misc (jumper wires, breadboards, PDBs, standoff kits, XT60 connectors)

Fully detailed entries include real manufacturer names, specs, and supplier URLs. Stub entries are flagged with `_stub: true` in their `specs` object so they're trivial to replace with hand-curated data later.

## MJCF scene templates

Five hand-crafted MuJoCo scenes live in `packages/simulation/src/templates.ts`:

- **empty** — flat ground plane
- **warehouse** — indoor shelves, ramps, pallets
- **outdoor_path** — grass, dirt path, rocks, incline
- **tabletop** — desk with small objects for manipulation
- **flight_space** — open 3D flight volume with colored corner markers

## Data model & persistence

The full Prisma schema (`apps/api/prisma/schema.prisma`) covers:

- `User` / `UserSettings` / `UserCredits`
- `Project` / `Message` / `ProjectVersion`
- `Component` / `Supplier`
- `AICall` / `AnalyticsEvent`

Auto-save runs every 2.5 s while a project is open. `?S` creates a manual version snapshot. Restoring a version swaps the live project state for the snapshot's `state` JSON blob.

## Project workflow (end to end)

1. User signs in (Clerk stub OR skipped for local dev).
2. Three-step onboarding — use case tags, experience level, CTA to enter the app.
3. Home view — type a prompt, click a template, or open a recent project.
4. Main workspace — iterate via natural language; watch the activity indicator, viewport, and drawer update.
5. Auto-save runs in the background; `?S` snapshots.
6. Sidebar right-click — rename, duplicate, archive, delete, export.
7. Settings view ? adjust theme, AI preference, fidelity, suppliers, privacy, etc.
8. Command palette (`?K`) — fuzzy-search everything.
9. Export — GET `/v1/projects/:id/export` returns a JSON bundle (BOM + firmware + simulation + assembly instructions).

## License

All rights reserved — proprietary alpha. Open-sourcing TBD.
