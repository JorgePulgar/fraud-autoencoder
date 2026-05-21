# Phase 4 — UI Part 1: Presets + Manual Input + Latency

**Goal:** Build the first visible end-to-end flow — header, preset runner with verdict + IF side-by-side, latency counter, manual input form with sliders, and the per-feature error bar chart shared between both.

**Depends on:** Phase 3 complete (`useModel`, scaler, inference, errors, threshold all working).

**Estimated time:** 3–4 h.

## Pre-session checklist

- [x] Phase 3 smoke test still works after a fresh `npm run dev`
- [x] You have `recharts`, `react-hook-form`, `zod`, `zustand` not yet installed — they're added in this phase as needed

## Tasks

- [x] **Task 4.1** — Build `src/components/Header.tsx`: project title in Geist Mono, one-line subtitle ("Static, in-browser fraud-detection demo"), and a small "Inference runs in your browser — no data leaves your device" badge in the corner. Add a nav link to the v1 repo (placeholder URL for now; final URL added in Phase 7). Wire it into `App.tsx`. Verify visually.
  - Commit: `feat(ui): add header with privacy badge`

- [x] **Task 4.2** — Add Zustand. `npm install zustand`. Create `src/store/index.ts` with: `lastPrediction: Prediction | null`, `lastInput: { scaled: number[]; raw: Record<string, number> } | null`, `setLastPrediction`, `setLastInput`. Verify: import the store in `App.tsx`, set a dummy prediction, log it. Remove the dummy after verifying.
  - Commit: `feat(store): add zustand store for last prediction and input`

- [x] **Task 4.3** — Build `src/components/PresetRunner.tsx`: list 6 cards (`presets.map`), each showing the preset id, true label badge (red/emerald), AE error placeholder, IF score, and a "Run" button. Clicking runs the full pipeline (scale → infer → error → classify), updates the store, and updates the card with the actual AE error + verdict color. Verify: clicking all 6 presets produces verdicts that broadly match the true labels (allow 1 mismatch).
  - Commit: `feat(ui): add preset runner with 6 curated rows`

- [x] **Task 4.4** — Add a `useLatency` hook + `src/components/LatencyCounter.tsx`. The hook wraps an async function with `performance.now()` timing and accumulates a rolling-mean. The component displays `Last: X.X ms · Avg: Y.Y ms (n)`. Wire it through the preset runner's inference call. Verify: clicking presets updates the counter; numbers are realistic (typically 1–10 ms on modern hardware after the first warm call).
  - Commit: `feat(ui): add live latency counter`

- [x] **Task 4.5** — Install Recharts. `npm install recharts`. Build `src/components/FeatureBarChart.tsx`: takes `perFeatureError: number[]` (length 30) and renders a Recharts bar chart with one bar per feature (Time, V1..V28, Amount). Tooltip on hover shows the feature name and squared-error value. Color-code: features with above-median error in violet, others in zinc-500. Verify: shows after running any preset; chart updates when a different preset is run.
  - Commit: `feat(ui): add per-feature reconstruction-error bar chart`

- [x] **Task 4.6** — Install `react-hook-form` and `zod`. `npm install react-hook-form @hookform/resolvers zod`. Build `src/components/ManualInputForm.tsx`: 30 inputs in a responsive grid. V1–V28 use shadcn `Slider` bounded to the train-set min/max (hard-code reasonable bounds: V1–V28 in `[-50, 50]`, Time in `[0, 172800]`, Amount in `[0, 25691]`). Defaults seeded from `presets[0].raw_features`. Submit button runs the pipeline. Verify: tweaking a slider then submitting updates the bar chart and verdict.
  - Commit: `feat(ui): add manual input form with sliders`

- [x] **Task 4.7** — Build `src/components/VerdictCard.tsx`: takes `Prediction` from the store and renders a large color-coded card — red "FRAUD DETECTED" with the AE error in Geist Mono, or emerald "LEGITIMATE" same shape. Place above the bar chart, visible whenever `lastPrediction` is not null. Verify: appears after running any preset or submitting the manual form.
  - Commit: `feat(ui): add verdict card`

- [x] **Task 4.8** — Layout pass on `App.tsx`. Compose the page top-to-bottom: Header → PresetRunner (left half on desktop) + ManualInputForm (right half) → VerdictCard (full width when populated) → FeatureBarChart (full width when populated) → LatencyCounter pinned to the corner. Use Tailwind grid/flex. Verify: end-to-end flow visually — load page, click a preset, see verdict + chart + latency update; switch to manual, tweak, submit, see new verdict.
  - Commit: `feat(ui): compose phase-4 page layout`

## Definition of done for Phase 4

- Loading the page shows skeleton state, then transitions to the populated UI.
- Clicking each of the 6 presets produces a verdict + bar chart + latency update.
- The manual input form, seeded from preset 0, runs successfully when submitted.
- The latency counter shows non-zero values, with averages in the single-digit ms range after warm-up.
- `tsc --noEmit` passes; all Vitest tests still pass.
- `git status` is clean.
- All boxes above are checked.

## End-of-phase commit

After all tasks above are checked:
- Commit: `chore(phase-v2-4): complete UI part 1`
- Update `tasks/v2/PHASES.md` to check off Phase 4.
- Commit: `docs(phases-v2): mark phase 4 as complete`
