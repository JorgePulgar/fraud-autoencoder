# v2 Project Phases — Roadmap

This file is the high-level map for the v2 demo. Each phase has its own file with detailed task checkboxes. Run **one phase per Claude Code session**.

For v2 sessions, the session-start protocol is:

1. Read `CONTEXT-v2.md` in full.
2. Read this file.
3. Read the current phase file in `tasks/v2/PHASE_N_*.md`.
4. Run `git log -n 20 --oneline --decorate` and `git log -n 5 --stat`.
5. State which phase you're working on and which tasks are still unchecked.
6. Wait for the user to confirm before starting any task.

The task execution rules from `CLAUDE.md` (one task = one commit, conventional commits, never check a box for unverified work) apply identically to v2.

## Phase diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1 — Asset export pipeline                                 │
│  Python script in v1 that writes ONNX + JSON into demo/public/   │
│  File: tasks/v2/PHASE_1_assets.md                                │
│  Depends on: v1 complete (autoencoder.onnx, scaler.pkl exist)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2 — Demo scaffold                                         │
│  Vite + React + TS + Tailwind + shadcn in demo/                  │
│  File: tasks/v2/PHASE_2_scaffold.md                              │
│  Depends on: Phase 1                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3 — Inference core                                        │
│  ONNX loader, scaler, threshold, predict(), per-feature errors   │
│  File: tasks/v2/PHASE_3_inference.md                             │
│  Depends on: Phase 2                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4 — UI part 1 (presets + manual + latency)                │
│  First end-to-end visible flow, per-feature bar chart            │
│  File: tasks/v2/PHASE_4_ui_basics.md                             │
│  Depends on: Phase 3                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5 — UI part 2 (CSV + threshold slider + histogram + IF)   │
│  Full feature set, shared zustand store                          │
│  File: tasks/v2/PHASE_5_ui_advanced.md                           │
│  Depends on: Phase 4                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6 — Polish, copy, framing                                 │
│  Banners, tooltips, footer, mobile breakpoint, error states      │
│  File: tasks/v2/PHASE_6_polish.md                                │
│  Depends on: Phase 5                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 7 — Deployment + cross-linking                            │
│  GitHub Actions, Pages, v1 README link, v2 README                │
│  File: tasks/v2/PHASE_7_deploy.md                                │
│  Depends on: Phase 6                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Status

Update this section as you complete phases:

- [x] Phase 1 — Asset export pipeline
- [x] Phase 2 — Demo scaffold
- [ ] Phase 3 — Inference core
- [ ] Phase 4 — UI part 1 (presets + manual + latency)
- [ ] Phase 5 — UI part 2 (CSV + threshold slider + histogram + IF)
- [ ] Phase 6 — Polish, copy, framing
- [ ] Phase 7 — Deployment + cross-linking
