# Phase 1 — Asset Export Pipeline

**Goal:** Produce all the static artifacts the demo will fetch, written into `demo/public/`. This phase is Python work in the v1 codebase; no frontend code yet.

**Depends on:** v1 complete. `models/autoencoder.onnx`, `models/scaler.pkl`, `models/threshold.json` exist locally.

**Estimated time:** 1–1.5 h.

## Pre-session checklist

- [ ] v1 artifacts present: `ls models/` shows `autoencoder.onnx`, `scaler.pkl`, `threshold.json`
- [ ] v1 dataset present: `data/raw/creditcard.csv` exists
- [ ] Working tree is clean

## Tasks

- [x] **Task 1.1** — Create `demo/` and `demo/public/` directories with `.gitkeep` files. Verify by `ls demo/public/` returning the `.gitkeep`.
  - Commit: `chore(demo): create demo scaffold directory`

- [x] **Task 1.2** — Update `.gitignore` to add explicit exceptions for the artifacts the demo needs to serve. Append a `# v2 demo artifacts (must ship)` section with:
  ```
  !demo/public/autoencoder.onnx
  !demo/public/*.json
  ```
  Verify by creating a dummy `demo/public/test.json` and running `git status`: it must appear as untracked. Delete the dummy before committing.
  - Commit: `chore(gitignore): allow demo/public artifacts to be tracked`

- [x] **Task 1.3** — Create `src/export_demo_assets.py` skeleton: argparse with `--out` (default `demo/public/`), loads `models/scaler.pkl`, `models/threshold.json`, the test split (reuse `src.data.load_and_split`), and the autoencoder via `torch.load`. Logs what it loaded. Verify by `python -m src.export_demo_assets --help` and `python -m src.export_demo_assets` printing the loaded shapes without writing files yet.
  - Commit: `feat(export): scaffold demo asset export script`

- [x] **Task 1.4** — Implement the `scaler.json` writer. Read `scaler.pkl`, write `{"mean": [...], "scale": [...], "feature_order": ["Time", "V1", ..., "V28", "Amount"]}` to `demo/public/scaler.json`. Verify: load the JSON back, apply `(row - mean) / scale` to a known test row, compare to `scaler.transform(row)` from sklearn — diff must be 0 (or `< 1e-10`).
  - Commit: `feat(export): write scaler.json with mean/scale/feature_order`

- [ ] **Task 1.5** — Copy `threshold.json` verbatim to `demo/public/threshold.json` and copy `models/autoencoder.onnx` to `demo/public/autoencoder.onnx`. Verify: `onnxruntime.InferenceSession("demo/public/autoencoder.onnx")` loads successfully and a forward pass on a single scaled row returns shape `(1, 30)`.
  - Commit: `feat(export): copy onnx model and threshold into demo/public`

- [ ] **Task 1.6** — Build `presets.json`. Deterministically sample 3 legit + 3 fraud rows from the test set (sort by index, take first 3 of each class). For each row, compute AE reconstruction error in Python (per-sample MSE across 30 features). Also refit Isolation Forest (`contamination=0.0017`, `random_state=42`) on training-set features and score these 6 rows. Write a list with `{id, raw_features: {Time, V1..V28, Amount}, true_label (0|1), ae_error: float, if_score: float}` per row to `demo/public/presets.json`. Verify: 6 entries, schema correct, ae_error > 0 for all, true_label distribution is exactly 3 legit + 3 fraud.
  - Commit: `feat(export): write presets.json with 6 curated test rows`

- [ ] **Task 1.7** — Build `histogram-data.json`. For the full test set, compute AE reconstruction errors. Take all 90+ frauds and a deterministic random sample of 500 legit rows (`random_state=42`). Write `{"samples": [{"error": float, "label": 0|1}, ...]}` to `demo/public/histogram-data.json`. Verify: file exists, `len(samples) == n_fraud_in_test + 500`, both labels present, errors are all positive floats.
  - Commit: `feat(export): write histogram-data.json for chart`

- [ ] **Task 1.8** — Add a `--verify` flag to `src/export_demo_assets.py` that runs all the above verifications inline (re-reads each emitted JSON, sanity-checks shapes/values, re-runs the scaler comparison, re-runs an ONNX forward pass). Verify by `python -m src.export_demo_assets --verify` printing `OK` for each artifact.
  - Commit: `feat(export): add --verify flag for end-to-end sanity check`

## Definition of done for Phase 1

- `python -m src.export_demo_assets --verify` runs clean from a fresh shell.
- `git status` is clean.
- `demo/public/` contains: `autoencoder.onnx`, `scaler.json`, `threshold.json`, `presets.json`, `histogram-data.json`, `.gitkeep`.
- All five artifacts are tracked by git.
- All boxes above are checked.

## End-of-phase commit

After all tasks above are checked:
- Commit: `chore(phase-v2-1): complete asset export pipeline`
- Update `tasks/v2/PHASES.md` to check off Phase 1.
- Commit: `docs(phases-v2): mark phase 1 as complete`
