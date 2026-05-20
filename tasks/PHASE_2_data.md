# Phase 2 — Data

**Goal:** Build the data pipeline (load, split, scale) and the EDA notebook. By the end of this phase, the autoencoder will have clean inputs to train on.

**Depends on:** Phase 1.

**Estimated time:** 1–1.5 hours.

## Pre-session checklist

- [ ] Phase 1 is fully complete (all boxes checked, `PHASES.md` updated).
- [ ] User has downloaded `creditcard.csv` from Kaggle and placed it at `data/raw/creditcard.csv`. Verify with `ls -lh data/raw/creditcard.csv` (should be ~150 MB).

## Tasks

- [x] **Task 2.1** — In `src/data.py`, implement `load_raw_data(path: str) -> pd.DataFrame`. It must:
  - Load the CSV
  - Validate shape is `(284807, 31)` — raise a clear error if not
  - Validate columns include `Time`, `V1`..`V28`, `Amount`, `Class` — raise a clear error if not
  - Return the DataFrame
  Verify with a small script that loads the data and prints shape + class counts.
  - Commit: `feat(data): add raw data loader with validation`

- [ ] **Task 2.2** — In `src/data.py`, implement `split_data(df: pd.DataFrame, seed: int) -> dict` that returns a dict with keys `X_train_full`, `y_train_full`, `X_val`, `y_val`, `X_test`, `y_test`. It must:
  - Drop `Class` from features
  - Use `sklearn.model_selection.train_test_split` with `stratify=y` twice to achieve 70/15/15 split
  - Use `random_state=seed`
  - Return numpy arrays (not DataFrames)
  Verify by printing shapes and confirming fraud appears in val and test (`y_val.sum() > 0`, `y_test.sum() > 0`).
  - Commit: `feat(data): add stratified train/val/test split`

- [ ] **Task 2.3** — In `src/data.py`, implement `fit_scaler(X_train_legit: np.ndarray) -> StandardScaler`. It must:
  - Fit a `StandardScaler` on the input (which is the legit-only training subset)
  - Return the fitted scaler
  And implement `apply_scaler(scaler, X) -> np.ndarray` that transforms any array.
  Verify by checking that `scaler.mean_` and `scaler.scale_` have length 30.
  - Commit: `feat(data): add scaler fitting and application`

- [ ] **Task 2.4** — In `src/data.py`, implement a top-level `prepare_data(seed: int) -> dict` that:
  - Calls `load_raw_data`
  - Calls `split_data`
  - Extracts `X_train_legit = X_train_full[y_train_full == 0]` (BEFORE scaling)
  - Fits the scaler on `X_train_legit` only (no leakage)
  - Saves the scaler to `models/scaler.pkl` using `joblib`
  - Applies the scaler to all X arrays: `X_train_full`, `X_train_legit`, `X_val`, `X_test`
  - Returns a dict with `X_train_full`, `y_train_full`, `X_train_legit`, `X_val`, `y_val`, `X_test`, `y_test` (all X arrays scaled)
  Note: `X_train_full` / `y_train_full` are exposed so Phase 4 baselines (Logistic Regression) can train on the full labeled training set. The autoencoder still trains on `X_train_legit` only.
  Verify by running it from a Python REPL and printing all 7 shapes + class counts (`y_train_full.sum()`, `y_val.sum()`, `y_test.sum()`) + `scaler.mean_`.
  - Commit: `feat(data): add full data preparation pipeline`

- [ ] **Task 2.5** — Add an explicit no-leakage assertion inside `prepare_data` or as a separate test: after scaling, assert that fraud examples from `X_val` and `X_test` were NOT seen during scaler fitting. (Easy way: count rows fed to the scaler and compare to `(y_train_full == 0).sum()`.)
  - Commit: `test(data): assert no leakage in scaler fitting`

- [ ] **Task 2.6** — Create `notebooks/01_eda.ipynb` with these cells (keep it tight, ~15–20 cells):
  1. Markdown: title + one-paragraph description
  2. Imports + `prepare_data` setup (but EDA should work from the raw dataframe before scaling — load it directly)
  3. Show `df.head()`, `df.shape`, `df.dtypes`
  4. Class distribution: count + percentage, bar plot
  5. `Amount` distribution: histogram with log scale, separate for fraud vs legit
  6. `Time` distribution: histogram for fraud vs legit
  7. Correlation of V1–V28 with Class: heatmap or bar chart of absolute correlations (sorted)
  8. Markdown conclusions: 3–4 sentences on what we learned and what it implies for modeling
  Verify by running all cells top-to-bottom without errors.
  - Commit: `feat(notebooks): add EDA notebook`

- [ ] **Task 2.7** — Save 1–2 key EDA figures to `reports/figures/` (class_distribution.png, amount_by_class.png). These will be referenced in the final README and video.
  - Commit: `feat(reports): save EDA figures`

## Definition of done for Phase 2

- `python -c "from src.data import prepare_data; d = prepare_data(42); print({k: v.shape for k, v in d.items() if hasattr(v, 'shape')})"` prints all 7 shapes (`X_train_full`, `y_train_full`, `X_train_legit`, `X_val`, `y_val`, `X_test`, `y_test`) with sensible numbers.
- `models/scaler.pkl` exists.
- `notebooks/01_eda.ipynb` runs end-to-end without errors.
- All boxes above are checked.

## End-of-phase commit

- Commit: `chore(phase-2): complete phase 2 data pipeline`
- Update `PHASES.md` to check off Phase 2.
- Commit: `docs(phases): mark phase 2 as complete`
