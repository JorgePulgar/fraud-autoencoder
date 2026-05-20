# Phase 1 — Setup

**Goal:** Scaffold the repository with all the boilerplate, configuration, and dependencies so that subsequent phases can focus purely on logic.

**Depends on:** Nothing.

**Estimated time:** 30–45 minutes.

## Pre-session checklist (user does this before Claude Code starts)

- [ ] Project directory exists and is empty (except for the spec files: `CLAUDE.md`, `CONTEXT.md`, `WORKFLOW.md`, `tasks/PHASES.md`, `tasks/PHASE_*.md`)
- [ ] `git init` has been run in the project root
- [ ] Initial commit with just the spec files exists: `git add . && git commit -m "chore: initial spec files"`
- [ ] Python 3.10+ is available
- [ ] Claude Code has been instructed to read `WORKFLOW.md` first

## Tasks

- [x] **Task 1.1** — Create `.gitignore` covering Python, data, models, virtual envs, OS files, IDE files, ONNX artifacts. Verify by running `git status` after creating dummy files in `data/raw/`, `models/`, `.venv/` — none should appear as untracked.
  - Commit: `chore(repo): add gitignore`

- [x] **Task 1.2** — Create folder structure: `data/raw/`, `models/`, `notebooks/`, `src/`, `reports/figures/`. Add a `.gitkeep` file inside each empty folder so they are tracked.
  - Commit: `chore(repo): scaffold folder structure`

- [x] **Task 1.3** — Create `requirements.txt` with pinned versions for: `torch`, `numpy`, `pandas`, `scikit-learn`, `joblib`, `matplotlib`, `seaborn`, `onnx`, `onnxruntime`, `jupyter`. Use versions known to be compatible with Python 3.10+. Verify by running `pip install -r requirements.txt` in a fresh venv and confirming no errors.
  Note: `joblib` is pinned explicitly (not relied on as a sklearn transitive dep) because Phase 2 Task 2.4 saves the scaler via `joblib.dump`.
  - Commit: `chore(deps): pin python dependencies`

- [ ] **Task 1.4** — Create `src/__init__.py` (can be empty) so `src` is importable as a module.
  - Commit: `chore(src): add src package init`

- [ ] **Task 1.5** — Create `src/config.py` with a single `Config` dataclass (or module-level constants) holding:
  - Paths: `DATA_PATH`, `MODELS_DIR`, `REPORTS_DIR`, `FIGURES_DIR`
  - Seeds: `RANDOM_SEED = 42`
  - Split ratios: `TRAIN_RATIO = 0.70`, `VAL_RATIO = 0.15`, `TEST_RATIO = 0.15`
  - Model: `INPUT_DIM = 30`, `HIDDEN_DIMS = [20, 14, 7, 14, 20]`
  - Training: `LR = 1e-3`, `BATCH_SIZE = 256`, `MAX_EPOCHS = 50`, `EARLY_STOPPING_PATIENCE = 5`
  - Eval: `THRESHOLD_PERCENTILE = 99`
  Verify by `python -c "from src.config import Config; print(Config)"` from project root.
  - Commit: `feat(config): add central configuration module`

- [ ] **Task 1.6** — Create a tiny `src/utils.py` with a `set_seeds(seed: int)` function that seeds `random`, `numpy`, and `torch` (including `torch.cuda` and deterministic flags). Verify by importing and running it.
  - Commit: `feat(utils): add deterministic seed setter`

- [ ] **Task 1.7** — Smoke test: create a temporary script `test_setup.py` at project root that imports `src.config` and `src.utils`, calls `set_seeds(42)`, and prints "OK". Run it. After it passes, delete it and do NOT commit the deletion separately — just don't add it. (If accidentally committed, remove in a `chore` commit.)
  - No commit needed if test script is never staged.

## Definition of done for Phase 1

- `git status` is clean.
- `python -c "from src.config import Config; from src.utils import set_seeds; set_seeds(42); print('OK')"` prints OK with no errors.
- The folder structure matches `CONTEXT.md`.
- All boxes above are checked.

## End-of-phase commit

After all tasks above are checked:
- Commit: `chore(phase-1): complete phase 1 setup`
- Update `PHASES.md` to check off Phase 1.
- Commit: `docs(phases): mark phase 1 as complete`
