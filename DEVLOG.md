# Development Log

Running log of issues encountered during this project and how they were resolved. Append a new entry whenever something breaks, gets misdiagnosed, surprises you, or requires a spec change. The point is to keep a record of the *real* path — not just the clean final commits — so that lessons survive into the next iteration.

## Entry template

```markdown
## YYYY-MM-DD — <one-line title>
**Phase:** N
**Symptom:** what went wrong (the visible failure / confusion)
**Root cause:** the actual reason (not the symptom)
**Resolution:** what we did to fix it
**Commit:** <hash or `fix(...)` / `docs(...)` message>
```

Keep entries short. If the fix is non-obvious or has tradeoffs, add a one-line **Lesson** at the end.

---

## 2026-05-20 — `prepare_data` didn't expose `X_train_full` / `y_train_full`
**Phase:** 0 (pre-implementation spec validation)
**Symptom:** Phase 4 Task 4.6 specifies `train_logistic_regression(X_train_full, y_train_full)`, but Phase 2 Task 2.4's `prepare_data` return dict only included `X_train_legit, X_val, y_val, X_test, y_test`. Phase 4 would not have been able to run as written.
**Root cause:** The spec assumed the autoencoder-only training subset (`X_train_legit`) would be enough, forgetting that the LogReg baseline needs the *full* labeled training set.
**Resolution:** Updated Phase 2 Task 2.4 to return all 7 arrays (`X_train_full`, `y_train_full`, `X_train_legit`, `X_val`, `y_val`, `X_test`, `y_test`), with all X arrays scaled. Scaler still fit on `X_train_legit` only — no leakage. Also updated the Definition-of-done sanity check.
**Commit:** Captured in the initial spec commit (`chore: initial spec files`).
**Lesson:** When data prep serves multiple downstream consumers, list each consumer's required inputs explicitly before designing the return shape.

## 2026-05-20 — `joblib` missing from Phase 1 requirements
**Phase:** 0 (pre-implementation spec validation)
**Symptom:** Phase 2 Task 2.4 uses `joblib.dump` to save the scaler, but `joblib` was not listed in the Phase 1 Task 1.3 pinned requirements.
**Root cause:** `joblib` is a transitive dependency of scikit-learn, so it works by accident — but the project explicitly aims for pinned, reproducible deps.
**Resolution:** Added `joblib` to the Task 1.3 requirements list (between `scikit-learn` and `matplotlib`) with a rationale note.
**Commit:** Captured in the initial spec commit (`chore: initial spec files`).
**Lesson:** Transitive deps are not pinned deps. If a script imports it directly, it goes in `requirements.txt`.

## 2026-05-20 — Spec referenced phase files at repo root, but they live in `tasks/`
**Phase:** 0 (pre-implementation spec validation)
**Symptom:** `CONTEXT.md`, `WORKFLOW.md`, and `tasks/PHASE_1_setup.md` all referenced `PHASES.md` and `PHASE_*.md` as if they sat at the repo root. Actual location is `tasks/`. WORKFLOW's session-start step 2 ("Read `PHASES.md`") would have failed.
**Root cause:** Spec drift — the files were reorganized into `tasks/` after the spec was written, but the documentation wasn't updated.
**Resolution:** Updated all three files to use the correct `tasks/` prefix. Also added `CLAUDE.md` and `DEVLOG.md` to the CONTEXT.md repo-structure tree.
**Commit:** Captured in the initial spec commit (`chore: initial spec files`).
**Lesson:** Filesystem and spec drift in opposite directions when neither is canonical. Treat the spec as binding and rerun a path-check after any reorganization.

---

## 2026-05-20 — Autoencoder PR-AUC (0.37) far below spec target (0.70)

**Phase:** 4 — Evaluation & Baselines

**Symptom:** After implementing the full evaluation pipeline and running end-to-end, the autoencoder achieved PR-AUC = 0.3769 and ROC-AUC = 0.9267 on the test set. The spec's success criterion required PR-AUC ≥ 0.70.

**Root cause:** The 0.70 PR-AUC target was set too optimistically for an unsupervised reconstruction-based method on a severely imbalanced dataset (0.17% fraud). The hard constraint is structural: the test set contains 147 legitimate transactions whose reconstruction errors are higher than some fraud cases. Since PR-AUC is a rank-based metric — it depends purely on the *ordering* of scores, not their magnitude — no post-processing transform can fix this. The autoencoder has simply not learned to rank those 147 "unusual legitimate" transactions below all fraud. The Logistic Regression baseline (supervised, full label access) achieved PR-AUC = 0.7928, confirming the features are separable but the unsupervised ceiling is lower.

**What we tried:**

1. **Increase MAX_EPOCHS 50 → 200 with early stopping** (`fix(config): increase MAX_EPOCHS to 200 for better convergence`).
   - Training stopped at epoch 86 (early stopping triggered), best val loss improved 0.4021 → 0.3981.
   - PR-AUC result: 0.3668 — marginally *lower* than before (noise, not a meaningful regression).
   - Conclusion: more epochs are not the bottleneck; the model was already near convergence.

2. **log1p transform on reconstruction errors before thresholding** (`fix(evaluate): apply log1p to reconstruction errors before thresholding`).
   - Hypothesis: compressing the extreme-outlier tail of legit errors (max ~86) would improve threshold placement and precision.
   - Result: PR-AUC unchanged at 0.3668. log1p, sqrt, and raw scores all produce identical PR-AUC.
   - Root cause of null result: any monotonic transform preserves the score ranking exactly, so the PR curve is unchanged. The transform was reverted.

**What could improve PR-AUC but is out of scope for this project:**

- **Denoising Autoencoder:** add Gaussian noise to inputs during training, forcing the model to learn a tighter manifold. Reduces false-positive reconstruction errors on unusual-but-legitimate transactions. Estimated gain: +0.10–0.15 PR-AUC.
- **Variational Autoencoder (VAE):** the KL regularisation on the latent space constrains the model to a smoother prior, compressing the legitimate distribution and widening the margin over fraud. Estimated gain: +0.15–0.20 PR-AUC. Listed in CONTEXT.md as future work.
- **Robust / Huber loss:** reduces the gradient contribution of high-error samples (unusual legit) during training, lowering their reconstruction errors and thus their false-positive rate. Estimated gain: +0.05–0.10 PR-AUC.
- **Supervised classifier (LR, XGBoost):** directly optimises for label separation. LR achieves PR-AUC = 0.79 with zero tuning. XGBoost would likely exceed 0.85. Excluded by spec: the project's central argument is the unsupervised framing for evolving fraud patterns where labels are scarce.

**Resolution:**

- Reverted the log1p change (no benefit, adds confusion).
- Kept MAX_EPOCHS = 200 (reasonable upper bound; early stopping handles actual stopping).
- **Did not change the 0.70 success criterion.** Lowering it post-hoc to match our result would be goalpost-moving — intellectually dishonest regardless of whether the reasoning is correct. The 0.70 target stays in `CONTEXT.md` as the original ambitious goal. The README will state plainly that the autoencoder achieves PR-AUC = 0.37, explain why, and let the reader judge.
- The honest framing for the README and video: the ROC-AUC of 0.92 shows the model has strong ranking quality with zero label access. The PR-AUC gap versus Logistic Regression (0.79) is the expected and documented cost of the unsupervised choice — not a defect, but a tradeoff the project is designed to make visible. Any supervised method would close that gap immediately; that is precisely the point the project is arguing against.

**Commits:**
- `fix(config): increase MAX_EPOCHS to 200 for better convergence`
- `fix(evaluate): apply log1p to reconstruction errors before thresholding` *(reverted)*
- `revert(evaluate): remove log1p transform — no effect on rank-based PR-AUC`
- `docs(context): restore original PR-AUC target; document gap honestly in DEVLOG`

**Lesson:** PR-AUC is a rank-based metric. Post-processing transforms that preserve score ordering cannot improve it. Improving PR-AUC for a reconstruction-based anomaly detector requires a better model (tighter learned manifold), not better scoring arithmetic. Also: change success criteria before running experiments, not after seeing results you don't like.
