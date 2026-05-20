# Phase 3 — Inference Core

**Goal:** Implement and verify the TypeScript inference pipeline: load ONNX + scaler + threshold + presets + histogram data; apply scaler; run model; compute reconstruction error; classify. No UI yet — this phase is all `lib/` + one `useModel` hook + a smoke-test component.

**Depends on:** Phase 2 complete (Vite project runs, shadcn ready).

**Estimated time:** 2–2.5 h.

## Pre-session checklist

- [ ] `demo/public/` contains all 5 artifacts
- [ ] `npm run dev` works from `demo/`
- [ ] You know the values in `presets.json` (you'll use them as test fixtures)

## Tasks

- [ ] **Task 3.1** — Install `onnxruntime-web`. `npm install onnxruntime-web`. Configure Vite to serve the wasm files: in `vite.config.ts`, copy the wasm assets via `vite-plugin-static-copy` or set `optimizeDeps.exclude: ['onnxruntime-web']` and import `import * as ort from 'onnxruntime-web'` with `ort.env.wasm.wasmPaths` pointed at the deployed asset path. Verify: a smoke import in `App.tsx` (`import * as ort from 'onnxruntime-web'`) compiles and the dev page loads without console errors.
  - Commit: `feat(demo): add onnxruntime-web with wasm asset config`

- [ ] **Task 3.2** — Create `src/types/index.ts` defining: `ScalerParams { mean: number[]; scale: number[]; feature_order: string[] }`, `Threshold { p99: number; f1_optimal: number }`, `Preset { id: string; raw_features: Record<string, number>; true_label: 0 | 1; ae_error: number; if_score: number }`, `HistogramSample { error: number; label: 0 | 1 }`, `Prediction { error: number; perFeatureError: number[]; verdict: 'fraud' | 'legit' }`. Verify: `tsc --noEmit` passes.
  - Commit: `feat(lib): add core type definitions`

- [ ] **Task 3.3** — Create `src/lib/scaler.ts` exporting `applyScaler(x: number[], params: ScalerParams): number[]` that returns `x.map((v, i) => (v - params.mean[i]) / params.scale[i])`. Add `featuresToVector(features: Record<string, number>, order: string[]): number[]` that projects a feature object into the canonical order. Verify with an inline test: for `presets.json[0].raw_features`, compute the scaled vector and compare to Python output (write a tiny `scaler.test.ts` using Vitest; install Vitest in this task too).
  - Commit: `feat(lib): implement scaler with feature-order projection`

- [ ] **Task 3.4** — Create `src/lib/inference.ts` with `loadModel(url: string): Promise<InferenceSession>` and `runInference(session, scaledFeatures: number[]): Promise<Float32Array>`. The latter creates an `ort.Tensor('float32', Float32Array.from(scaledFeatures), [1, 30])`, calls `session.run({ input: tensor })` (or whatever the input name is — log `session.inputNames` first), and returns the output Float32Array. Verify: load `autoencoder.onnx`, run on a scaled preset row, log output `.length === 30`.
  - Commit: `feat(lib): implement onnx model loading and inference`

- [ ] **Task 3.5** — Create `src/lib/errors.ts` with `reconstructionError(input: number[], output: Float32Array): { perFeature: number[]; total: number }` returning per-feature squared error and mean (matching Python's per-sample MSE definition). Verify: for `presets.json[0]`, the computed `total` must match `ae_error` from the JSON to within `1e-5`. Write the assertion as a Vitest test using the first preset row as a fixture.
  - Commit: `feat(lib): implement reconstruction-error computation with numerical test`

- [ ] **Task 3.6** — Create `src/lib/threshold.ts` with `classify(error: number, threshold: number): 'fraud' | 'legit'` returning `'fraud'` if `error > threshold`. Verify with a Vitest test: for each preset, `classify(preset.ae_error, threshold.f1_optimal)` must match `preset.true_label === 1 ? 'fraud' : 'legit'` for at least 5 out of 6 presets (allow 1 mismatch since the model is imperfect — log which one).
  - Commit: `feat(lib): implement threshold classifier`

- [ ] **Task 3.7** — Create `src/hooks/useModel.ts` — a React hook that, on mount, fetches all five artifacts (`autoencoder.onnx`, `scaler.json`, `threshold.json`, `presets.json`, `histogram-data.json`) from the `BASE_URL` and returns `{ status: 'loading' | 'ready' | 'error', session, scaler, threshold, presets, histogramData, error }`. Use `Promise.all` for the JSON fetches; load ONNX after. Verify by replacing `App.tsx`'s placeholder with a component that calls `useModel()` and displays the status; should transition `loading → ready` within ~2s.
  - Commit: `feat(hooks): implement useModel artifact loader`

- [ ] **Task 3.8** — Create a temporary smoke-test page: a single button "Run preset 0" that, when clicked, takes `presets[0]`, scales its raw features, runs inference, computes error, classifies, and prints `{ error, total, verdict, expected }` to the page. Verify visually: the displayed verdict matches the expected. Leave this in place — Phase 4 will replace it with the real preset runner.
  - Commit: `feat(demo): wire smoke-test page running first preset end-to-end`

## Definition of done for Phase 3

- All Vitest tests pass (`npm test` from `demo/`).
- Smoke-test page in the browser loads the model in < 3s and clicking "Run preset 0" produces a verdict + error that matches the JSON within `1e-5`.
- `tsc --noEmit` passes.
- `git status` is clean.
- All boxes above are checked.

## End-of-phase commit

After all tasks above are checked:
- Commit: `chore(phase-v2-3): complete inference core`
- Update `tasks/v2/PHASES.md` to check off Phase 3.
- Commit: `docs(phases-v2): mark phase 3 as complete`
