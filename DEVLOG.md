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
