# Project Context — v2 (In-Browser Demo)

**Read this file at the start of every v2 session, before `tasks/v2/PHASES.md` and the current phase file.**

This is the v2 spec for the fraud-autoencoder project. v1 (the Python research project) is complete; its source of truth is `CONTEXT.md`. v2 is additive: it lives in the same repo under `demo/`, consumes v1's artifacts, and ships a static, in-browser demo.

## What this project is

A static web demo of the v1 autoencoder. Inference runs entirely client-side in the visitor's browser via ONNX Runtime Web. Hosted on GitHub Pages. Acts as the interactive face of the v1 engineering writeup — recruiters and reviewers can play with the model without installing anything.

## Why a static in-browser demo

- **Zero-cost, zero-ops hosting.** No server, no API, no rate limits, no surprise bills.
- **Demo-able privacy story.** "Your data never leaves your device" is true because the model runs locally — a meaningful narrative for a fraud-detection demo.
- **Portfolio leverage.** v1 demonstrates research engineering; v2 demonstrates productization. Together they cover the full AI Engineering loop.

## Tech stack (locked-in)

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (`new-york` style, dark mode only)
- **Charts:** Recharts
- **Forms:** `react-hook-form` + `zod`
- **CSV parsing:** Papa Parse
- **State:** Zustand (single store for the shared threshold + last-prediction values)
- **Inference runtime:** `onnxruntime-web` (wasm backend, SIMD-enabled, single-threaded — GitHub Pages cannot set the COOP/COEP headers required for threaded wasm)
- **Mono font:** Geist Mono via `@fontsource`

## Asset pipeline (locked-in)

A new Python script lives in v1: `src/export_demo_assets.py`. It reads v1's `models/scaler.pkl`, `models/threshold.json`, `models/autoencoder.onnx`, and the test split, and writes the following into `demo/public/`:

- `autoencoder.onnx` — the trained model, copied verbatim
- `scaler.json` — `{mean: number[30], scale: number[30], feature_order: string[30]}`
- `threshold.json` — `{p99, f1_optimal}`, copied verbatim
- `presets.json` — 6 curated test-set rows (3 legit, 3 fraud), each with raw feature values, ground-truth label, AE reconstruction error (Python-computed, used as a numerical reference for the TS implementation), and precomputed Isolation Forest score
- `histogram-data.json` — reconstruction-error samples for the histogram chart: all 90 test-set frauds + a deterministically sampled 500 legit rows, each with `{error, label}`

**Isolation Forest:** the export script refits IF (`contamination=0.0017`, `random_state=42`) on the training-set features and scores the 6 preset rows. No IF model ships to the browser.

## Scaler in the browser

`scaler.json` is fetched once at startup. `applyScaler(x)` does `(x - mean) / scale` element-wise in TS. The `feature_order` array is the authoritative input order — the manual-input form and CSV upload both project their inputs into this order before scaling.

## Features (locked-in)

1. **Preset transactions** — 6 curated rows (3 legit, 3 fraud). One-click run. Verdict + IF side-by-side + per-feature error chart.
2. **Manual input form** — V1–V28 (sliders bounded to train-set observed min/max), Time + Amount (number inputs). Defaults seeded from the first preset row. Submit runs inference.
3. **CSV batch upload** — drag-drop. Schema-validated (must contain Time, V1–V28, Amount; ignores any Class column). Returns a sortable table with per-row reconstruction error + verdict.
4. **Interactive threshold slider** — bounded by the min/max error in `histogram-data.json`. Drags re-classify all loaded rows (presets + CSV batch) and move the histogram threshold line in real time.

## Visualizations (locked-in)

1. **Per-feature reconstruction-error bar chart** — for the most recently run input, 30 bars showing per-feature squared error.
2. **Reconstruction-error histogram** — binned distribution from `histogram-data.json`, color-coded by label (legit = emerald, fraud = red), with a `ReferenceLine` at the slider's current threshold.
3. **Isolation Forest side-by-side** — only on the 6 preset rows (IF scores are precomputed). Manual/CSV inputs display "IF: N/A — preset only".
4. **Live latency counter** — last single-row inference time in ms + session rolling average.

## Visual design (locked-in)

- shadcn `new-york`, dark mode only, no theme toggle.
- Accent palette: `violet-500` (primary action), `red-500` (fraud verdict), `emerald-500` (legit verdict).
- Geist Mono for headings + all numeric output. Inter (Tailwind default) for body.
- Engineer aesthetic: numeric values are the protagonist, no marketing language.

## Copy & framing (locked-in)

- UI in English. One short Spanish blurb in the footer.
- Always-visible disclaimer banner: "Portfolio project on public Kaggle data. Not a production fraud system."
- Always-visible privacy badge near the model loader: "Inference runs entirely in your browser — no data leaves your device."
- Footer links: v1 repo, v1 DEVLOG, MIT license, author contact.
- "Why PR-AUC 0.37?" — surfaced as a shadcn `Popover` on a help icon next to the metrics panel, not as wall-of-text body copy.

## Loading & edge cases (locked-in)

- shadcn `Skeleton` placeholders during ONNX + JSON fetch (~1–2s cold load).
- shadcn `Sonner` toast for invalid CSV uploads, with offending row numbers.
- Friendly error card if the ONNX model fails to load (offers a reload button).
- Mobile breakpoint at 768px: threshold slider → number input; charts stack vertically; manual-input form collapses into an accordion. Mobile is usable, not optimized.

## Deployment (locked-in)

- `.github/workflows/deploy-demo.yml`: triggers on push to `main` when `demo/**` changes; runs `npm ci && npm run build` inside `demo/`; deploys `demo/dist/` via `actions/deploy-pages@v4`.
- Pages source set to "GitHub Actions" — one-time manual step, documented in `demo/README.md`.
- Deployed URL: `https://<github-user>.github.io/fraud-autoencoder/` (subpath, so Vite `base: '/fraud-autoencoder/'`).

## Repository structure (delta from v1)

```
fraud-autoencoder/
├── CONTEXT.md                       # v1 (existing, untouched)
├── CONTEXT-v2.md                    # this file
├── CLAUDE.md                        # extended with v2 protocol
├── .gitignore                       # extended with demo/public exceptions
├── src/
│   └── export_demo_assets.py        # NEW (Phase 1)
├── tasks/
│   ├── PHASES.md                    # v1 (existing)
│   ├── PHASE_*.md                   # v1 (existing)
│   └── v2/                          # NEW
│       ├── PHASES.md
│       ├── PHASE_1_assets.md
│       ├── PHASE_2_scaffold.md
│       ├── PHASE_3_inference.md
│       ├── PHASE_4_ui_basics.md
│       ├── PHASE_5_ui_advanced.md
│       ├── PHASE_6_polish.md
│       └── PHASE_7_deploy.md
├── demo/                            # NEW
│   ├── README.md
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/                      # ONNX + JSON artifacts (committed)
│   │   ├── autoencoder.onnx
│   │   ├── scaler.json
│   │   ├── threshold.json
│   │   ├── presets.json
│   │   └── histogram-data.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/              # UI components
│       ├── lib/                     # inference, scaler, types, errors, threshold
│       ├── hooks/                   # useModel, useLatency
│       ├── store/                   # zustand store
│       └── types/
└── .github/workflows/
    └── deploy-demo.yml              # NEW (Phase 7)
```

## .gitignore exceptions

The v1 `.gitignore` blocks `models/*.onnx`, `models/*.pkl`, `models/*.json`. v2 needs to *serve* these artifacts, so Phase 1 adds explicit exceptions:

```
!demo/public/autoencoder.onnx
!demo/public/*.json
```

The v1 rules stay intact.

## Success criteria

- `npm ci && npm run build` inside `demo/` produces a `dist/` that, when served statically, loads and runs end-to-end (presets, manual, CSV, threshold slider all work).
- A fresh visitor on a mid-spec laptop sees first-paint within 2s and first-inference within 3s.
- TS-computed reconstruction error matches Python-computed error from `presets.json` to within `1e-5` for every preset row.
- The deployed Pages URL is reachable, all assets load with no console errors, and the GitHub Actions workflow is green on `main`.
- The v1 README links to the deployed URL; the v2 `demo/README.md` links back to the v1 README.

## Out of scope (do not build)

- User accounts, auth, persisting results across sessions.
- Browser-side retraining or fine-tuning.
- Mobile-optimized layout (best-effort responsive only).
- WCAG AA accessibility audit (shadcn defaults are good enough; no axe pass).
- i18n / EN-ES language toggle.
- Server-side anything (functions, edge, KV).
- A second ONNX model for Isolation Forest in the browser — IF is precomputed for presets only.

## Author context

Same as v1: Jorge Pulgar, Junior AI Engineer in Madrid. README and copy in English, with a short Spanish footer blurb. Professional and technically honest tone. License: MIT.
