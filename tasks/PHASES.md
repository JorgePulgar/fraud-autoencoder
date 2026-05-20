# Project Phases — Roadmap

This file is the high-level map. Each phase has its own file with detailed task checkboxes. Run **one phase per Claude Code session**.

## Phase diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1 — Setup                                                 │
│  Repo scaffold, gitignore, requirements, config, sanity checks   │
│  File: PHASE_1_setup.md                                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2 — Data                                                  │
│  Loading, stratified split, scaler, EDA notebook                 │
│  File: PHASE_2_data.md                                           │
│  Depends on: Phase 1                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3 — Model & Training                                      │
│  Autoencoder architecture, training loop, early stopping         │
│  File: PHASE_3_model.md                                          │
│  Depends on: Phase 2                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4 — Evaluation & Baselines                                │
│  Threshold selection, metrics, baselines, plots, comparison      │
│  File: PHASE_4_evaluation.md                                     │
│  Depends on: Phase 3                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5 — ONNX Export                                           │
│  Export, numerical sanity check (Day 1 end if possible)          │
│  File: PHASE_5_export.md                                         │
│  Depends on: Phase 3                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6 — Finalize                                              │
│  Results notebook, README, full reproducibility dry-run          │
│  File: PHASE_6_finalize.md                                       │
│  Depends on: Phase 4, Phase 5                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Suggested session schedule (2-day deadline)

| Day | Session | Phase(s) | Estimated time |
|-----|---------|----------|----------------|
| Day 1 morning | 1 | Phase 1 (Setup) | 30–45 min |
| Day 1 morning | 2 | Phase 2 (Data) | 1–1.5 h |
| Day 1 afternoon | 3 | Phase 3 (Model & Training) | 1.5–2 h |
| Day 1 evening | 4 | Phase 5 (ONNX Export) — quick sanity check | 30 min |
| Day 2 morning | 5 | Phase 4 (Evaluation & Baselines) | 2–3 h |
| Day 2 afternoon | 6 | Phase 6 (Finalize) | 1.5–2 h |
| Day 2 evening | — | Record video, submit | 2 h |

**Why Phase 5 (ONNX) before Phase 4 (Evaluation)?** Catching an ONNX export issue early is much cheaper than discovering it later. The export only needs the trained model from Phase 3.

## Status

Update this section as you complete phases:

- [x] Phase 1 — Setup
- [x] Phase 2 — Data
- [x] Phase 3 — Model & Training
- [x] Phase 4 — Evaluation & Baselines
- [x] Phase 5 — ONNX Export
- [x] Phase 6 — Finalize
