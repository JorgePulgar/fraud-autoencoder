# Phase 4 — Evaluation & Baselines

**Goal:** Produce the final metrics, baseline comparison, plots, and the markdown results table. This is the analytical heart of the project.

**Depends on:** Phase 3.

**Estimated time:** 2–3 hours.

## Pre-session checklist

- [ ] Phase 3 is fully complete.
- [ ] `models/autoencoder.pth` and `models/scaler.pkl` both exist.

## Tasks

- [ ] **Task 4.1** — In `src/evaluate.py`, implement `compute_reconstruction_errors(model, X, device) -> np.ndarray` that returns per-sample MSE across the 30 features.
  - Commit: `feat(evaluate): add reconstruction error computation`

- [ ] **Task 4.2** — In `src/evaluate.py`, implement `select_threshold(errors_val: np.ndarray, y_val: np.ndarray) -> dict` that returns both:
  - `threshold_p99`: 99th percentile of errors on validation legitimate transactions
  - `threshold_f1`: threshold that maximizes F1 on full validation set (scan candidate thresholds — use `precision_recall_curve` from sklearn and compute F1 at each, pick argmax)
  - The dict also includes the F1 value at each threshold
  Save the dict to `models/threshold.json`.
  - Commit: `feat(evaluate): add threshold selection logic`

- [ ] **Task 4.3** — In `src/evaluate.py`, implement `compute_metrics_at_threshold(errors, y_true, threshold) -> dict` returning precision, recall, F1, accuracy, confusion matrix counts (tn, fp, fn, tp).
  - Commit: `feat(evaluate): add threshold-based metrics`

- [ ] **Task 4.4** — In `src/evaluate.py`, implement `compute_threshold_independent_metrics(errors, y_true) -> dict` returning PR-AUC (average precision) and ROC-AUC.
  - Commit: `feat(evaluate): add threshold-independent metrics`

- [ ] **Task 4.5** — In `src/baselines.py`, implement `train_isolation_forest(X_train_legit) -> IsolationForest` with `contamination=0.0017`, `random_state=42`, `n_estimators=100`. Return the fitted model. Provide a `score(X)` wrapper that returns negative `decision_function` so higher = more anomalous (consistent with reconstruction error direction).
  - Commit: `feat(baselines): add isolation forest baseline`

- [ ] **Task 4.6** — In `src/baselines.py`, implement `train_logistic_regression(X_train_full, y_train_full) -> LogisticRegression` with `class_weight='balanced'`, `random_state=42`, `max_iter=1000`. Return the fitted model and provide a `score(X)` wrapper returning predicted positive-class probability.
  - Commit: `feat(baselines): add logistic regression baseline`

- [ ] **Task 4.7** — In `src/evaluate.py`, implement the main `evaluate(config) -> None` function:
  1. `set_seeds`, load data via `prepare_data`
  2. Load trained autoencoder from `models/autoencoder.pth`
  3. Compute reconstruction errors on val and test
  4. Select thresholds via `select_threshold` (using validation set)
  5. Compute test metrics at the F1-optimal threshold
  6. Compute PR-AUC and ROC-AUC for autoencoder
  7. Train and score both baselines on the same train/test splits
  8. Compute PR-AUC and ROC-AUC for both baselines
  9. Print a clean markdown table comparing all three models
  10. Save the table to `reports/results.md`
  - Commit: `feat(evaluate): add main evaluation orchestration`

- [ ] **Task 4.8** — In `src/evaluate.py`, add plotting functions and call them from `evaluate()`:
  - `plot_error_distribution(errors_test, y_test, threshold, save_path)` — histogram of reconstruction errors split by class, log y-scale, with threshold vertical line
  - `plot_pr_curve(scores_dict, y_test, save_path)` — PR curves for all 3 models on same axes (scores_dict is `{"Autoencoder": errors, "Isolation Forest": iso_scores, "Logistic Regression": lr_probs}`)
  - `plot_roc_curve(scores_dict, y_test, save_path)` — ROC curves for all 3 models
  - `plot_confusion_matrix(metrics_dict, save_path)` — confusion matrix heatmap for the autoencoder at chosen threshold
  All saved to `reports/figures/`.
  - Commit: `feat(evaluate): add evaluation plots`

- [ ] **Task 4.9** — Add CLI entrypoint at bottom of `src/evaluate.py`: `if __name__ == "__main__": evaluate(Config)`. Run `python -m src.evaluate` and verify:
  - `reports/results.md` exists with a sensible comparison table
  - All four figures exist in `reports/figures/`
  - Test PR-AUC for the autoencoder is ≥ 0.70 (success criterion from CONTEXT)
  - `models/threshold.json` exists
  - Commit: `chore(evaluate): verify end-to-end evaluation run`

## Definition of done for Phase 4

- `python -m src.evaluate` runs end-to-end without errors.
- All four figures are saved and look reasonable.
- `reports/results.md` contains a clean markdown comparison table.
- Test PR-AUC ≥ 0.70 for the autoencoder.
- All boxes above are checked.

## End-of-phase commit

- Commit: `chore(phase-4): complete phase 4 evaluation and baselines`
- Update `PHASES.md` to check off Phase 4.
- Commit: `docs(phases): mark phase 4 as complete`
