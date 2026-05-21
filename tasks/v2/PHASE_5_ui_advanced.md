# Phase 5 — UI Part 2: CSV Upload + Threshold Slider + Histogram + IF

**Goal:** Add the batch workflow (CSV upload + results table), the interactive threshold slider, the reconstruction-error histogram, and surface the precomputed Isolation Forest verdicts on the preset cards.

**Depends on:** Phase 4 complete (presets, manual input, latency, bar chart all working).

**Estimated time:** 3–4 h.

## Pre-session checklist

- [ ] Phase 4 flow still works end-to-end on a fresh `npm run dev`
- [ ] You know the schema the CSV upload will accept: `Time, V1, V2, ..., V28, Amount` (optional `Class` column ignored)

## Tasks

- [x] **Task 5.1** — Extend the Zustand store with `threshold: number` (initialized to `threshold.f1_optimal` from the loaded JSON) and `setThreshold`. Refactor `PresetRunner` and `ManualInputForm` to read the live threshold from the store instead of using `f1_optimal` directly. Verify: changing `threshold` in dev tools (or via a temporary debug input) re-classifies the last prediction without re-running inference.
  - Commit: `feat(store): add live threshold to store`

- [x] **Task 5.2** — Build `src/components/ThresholdSlider.tsx`: shadcn `Slider` bounded to `[min, max]` of `histogramData.samples.map(s => s.error)`. Reads and writes `threshold` in the store. Display the current value in Geist Mono next to the slider, plus a small "Reset to F1-optimal" button. Verify: dragging the slider updates the store; reset button restores `f1_optimal`.
  - Commit: `feat(ui): add interactive threshold slider`

- [x] **Task 5.3** — Build `src/components/ErrorHistogram.tsx`: Recharts BarChart binning `histogramData.samples` into ~40 buckets across the error range. Two bars per bucket (or stacked): emerald for legit count, red for fraud count. Add a `ReferenceLine` at the current `threshold` from the store. Verify: histogram renders with both colors visible; threshold line moves live as the slider drags.
  - Commit: `feat(ui): add reconstruction-error histogram`

- [ ] **Task 5.4** — Install Papa Parse. `npm install papaparse @types/papaparse`. Build `src/components/CSVUpload.tsx`: a shadcn-styled drag-drop area + a file picker fallback. On file selection, parse with Papa Parse, validate that `Time, V1..V28, Amount` columns exist, and store the parsed rows in a local `useState<ParsedRow[]>`. Show a row count when valid. Verify: drop a CSV slice of the original Kaggle data, see "N rows loaded".
  - Commit: `feat(ui): add csv upload with schema validation`

- [ ] **Task 5.5** — Install `sonner` via shadcn. `npx shadcn@latest add sonner`. Wire it into the layout. In `CSVUpload`, on parse error or schema mismatch, fire a `toast.error("Invalid CSV — missing columns: X")` or similar; for malformed rows, list up to 5 row numbers in the toast. Verify: dropping an obviously-broken CSV (missing the `V14` column) shows the toast with the right column name.
  - Commit: `feat(ui): toast on invalid csv with diagnostics`

- [ ] **Task 5.6** — Build `src/components/BatchResults.tsx`: takes the parsed rows from `CSVUpload`, runs inference on each (with a progress indicator if > 100 rows), and renders a sortable table — columns: row index, AE error (Geist Mono, 4 decimals), verdict (color-coded). The verdict reads the live threshold from the store, so changing the slider re-colors rows without re-inferring. Verify: upload a 50-row CSV; rows appear with verdicts; dragging the slider flips a handful between fraud/legit live.
  - Commit: `feat(ui): add batch results table with live re-classification`

- [ ] **Task 5.7** — Surface Isolation Forest on `PresetRunner`. Each preset card shows two badges side-by-side: "AE: {verdict}" and "IF: {fraud|legit}". The IF verdict comes from `preset.if_score` thresholded at the IF default (`> 0` is anomaly in sklearn's IsolationForest score convention — confirm by looking at the values in `presets.json`). For manual/CSV inputs, show "IF: N/A — preset only" as a small muted note next to the verdict card. Verify: all 6 presets show both badges; agreement/disagreement is visible at a glance.
  - Commit: `feat(ui): show isolation-forest verdict on preset cards`

- [ ] **Task 5.8** — Layout pass on `App.tsx`. Final composition: Header → (PresetRunner | ManualInputForm) → VerdictCard → FeatureBarChart → ThresholdSlider → ErrorHistogram → CSVUpload → BatchResults → LatencyCounter (pinned corner). Verify the full end-to-end story: load page → click presets → tweak manual → upload CSV → drag threshold slider, watch everything update in sync.
  - Commit: `feat(ui): compose final phase-5 page layout`

## Definition of done for Phase 5

- Dragging the threshold slider re-classifies preset cards, the verdict card, the histogram line, and the batch results table all in real time.
- A small CSV (10–100 rows) uploads and shows verdicts in < 1s.
- Isolation Forest badges appear on all 6 preset cards and show "N/A" elsewhere.
- The page has no console errors during a full flow.
- `tsc --noEmit` passes; all Vitest tests still pass.
- `git status` is clean.
- All boxes above are checked.

## End-of-phase commit

After all tasks above are checked:
- Commit: `chore(phase-v2-5): complete UI part 2`
- Update `tasks/v2/PHASES.md` to check off Phase 5.
- Commit: `docs(phases-v2): mark phase 5 as complete`
