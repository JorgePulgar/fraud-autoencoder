# Phase 6 — Finalize

**Goal:** Tie everything together with the results notebook, the README, and a final reproducibility dry-run. After this phase, the project is submission-ready and portfolio-ready.

**Depends on:** Phase 4 and Phase 5.

**Estimated time:** 1.5–2 hours.

## Pre-session checklist

- [ ] Phases 1–5 are all complete.
- [ ] `models/autoencoder.pth`, `models/scaler.pkl`, `models/threshold.json` all exist.
- [ ] `reports/results.md` and all figures in `reports/figures/` exist.

## Tasks

- [x] **Task 6.1** — Create `notebooks/02_results.ipynb` with the following structure:
  1. Markdown: title, problem statement (the "why an autoencoder" framing from `CONTEXT.md`)
  2. Imports + load model, scaler, threshold from disk
  3. Reload data via `prepare_data`
  4. Inline display of the comparison table (read from `reports/results.md` or recompute)
  5. Inline display of all 4 figures (training curves, error distribution, PR curve, ROC curve, confusion matrix)
  6. Markdown narrative connecting the results: what does the comparison show? When would the autoencoder be the better choice? What are its limits?
  7. Final markdown: "Future work" section mirroring the README
  Verify by running all cells top-to-bottom.
  - Commit: `feat(notebooks): add results notebook`

- [x] **Task 6.2** — Write `README.md` with these sections in order:
  1. **Title** + one-line description
  2. **Badges** (optional: Python version, license)
  3. **Project summary** (1 paragraph): the use case, the AI engineering framing, the headline result
  4. **Live demo** placeholder: `🔗 Live demo: coming soon (in-browser via ONNX Runtime Web + GitHub Pages)`
  5. **Results table** (copy/paste from `reports/results.md`) with autoencoder vs Isolation Forest vs Logistic Regression on PR-AUC, ROC-AUC, F1
  6. **Why an autoencoder** paragraph (use the framing from `CONTEXT.md`)
  7. **How to reproduce**:
     ```bash
     git clone <repo>
     cd fraud-autoencoder
     python -m venv .venv
     source .venv/bin/activate  # Windows: .venv\Scripts\activate
     pip install -r requirements.txt
     # Download creditcard.csv from Kaggle and place in data/raw/
     python -m src.train
     python -m src.evaluate
     python -m src.export_onnx
     ```
  8. **Project structure** (tree, copy from `CONTEXT.md`)
  9. **Key technical decisions** (short bullet list with one-line justifications):
     - Symmetric FC autoencoder (ONNX-export-friendly)
     - StandardScaler fit on training-set legit only (no leakage)
     - Stratified 70/15/15 split
     - Threshold selected on validation set to maximize F1
     - Baselines: Isolation Forest, Logistic Regression (class_weight='balanced')
  10. **Future work**:
      - In-browser demo via ONNX Runtime Web + GitHub Pages
      - Supervised baseline: XGBoost
      - Variational / denoising autoencoder variants
      - Cost-sensitive threshold tuning (cost matrix)
      - Concept-drift handling with periodic retraining
  11. **License**: MIT
  12. **Author**: Jorge Pulgar — LinkedIn / GitHub links
  13. **Spanish summary** (3–5 lines at the bottom)
  Verify by viewing the README in a markdown previewer.
  - Commit: `docs(readme): add full project readme`

- [x] **Task 6.3** — Add a `LICENSE` file (MIT).
  - Commit: `docs(license): add MIT license`

- [x] **Task 6.4** — Final reproducibility dry-run. In a fresh terminal:
  1. Create a brand-new venv: `python -m venv .venv-test`
  2. Activate it
  3. `pip install -r requirements.txt`
  4. `python -m src.train`
  5. `python -m src.evaluate`
  6. `python -m src.export_onnx`
  Verify all three scripts run successfully end-to-end. Note the wall-clock time for each in the commit message.
  - Commit: `chore(repro): verify full pipeline runs from fresh venv`

- [ ] **Task 6.5** — Clean up: delete `.venv-test/`, make sure `git status` is clean, make sure no stray debug files or `.ipynb_checkpoints/` are tracked.
  - Commit: `chore(repo): final cleanup` (only if there's something to clean — otherwise skip)

- [ ] **Task 6.6** — Final review. Open the README in a markdown previewer one more time. Read it as if you were a recruiter seeing it for the first time. If anything is unclear, vague, or missing, fix it.
  - Commit: `docs(readme): polish based on recruiter-perspective review` (only if changes made)

## Definition of done for Phase 6

- README renders cleanly and tells a coherent story end-to-end.
- Full pipeline runs from a fresh venv.
- All artifacts exist, all gitignored items are gitignored.
- `git status` is clean.
- All boxes above are checked.

## End-of-phase commit

- Commit: `chore(phase-6): project complete, ready for submission`
- Update `PHASES.md` to check off Phase 6.
- Commit: `docs(phases): mark phase 6 as complete — project done`

## What's NOT in this phase

The video recording and the actual submission are done outside Claude Code by the user. The live demo (Gradio / GitHub Pages + ONNX) is a separate v2 project to be built after class submission.
