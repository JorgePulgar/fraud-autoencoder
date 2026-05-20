# CLAUDE.md

Always-loaded behavior for Claude Code on this project. **`CONTEXT.md` is the source of truth** for what to build; this file says how to work.

## Session-start protocol

At the start of every session, in order:

1. Read `CONTEXT.md` in full.
2. Read `tasks/PHASES.md`.
3. Read the current phase file in `tasks/PHASE_N_*.md`.
4. Run `git log -n 20 --oneline --decorate` and `git log -n 5 --stat`.
5. State (in chat) which phase you're working on and which tasks are still unchecked.
6. Wait for the user to confirm before starting any task.

If anything in the spec contradicts what's in the code, stop and ask — do not improvise.

## Task execution rule

**One task = one commit.** For every task:

1. Implement it.
2. Verify it works (run the script, test, or check the task names).
3. Commit with a conventional-commit message: `feat(...)`, `fix(...)`, `chore(...)`, `docs(...)`, `test(...)`, `refactor(...)`.
4. Edit the phase file: `- [ ]` → `- [x]` for that task. Commit separately: `docs(phase-N): mark task X as done`.
5. Report a one-line summary to the user.
6. **Pause** and wait for the user to say "next" before continuing.

Never check a box for a task that isn't verified to work. A passing import is not a passing test.

## Project-specific do-NOT list

These are locked-in decisions from `CONTEXT.md`. Do not relitigate them mid-implementation:

- No SMOTE / oversampling. The autoencoder framing is the whole point.
- No Streamlit / Gradio / FastAPI / browser-side ONNX in this project — that's a separate v2 deployment project.
- No batch norm. No dropout in the decoder (encoder dropout 0.1 is optional, but the default is none).
- No XGBoost or other supervised gradient-boosted baselines. Baselines are Isolation Forest + Logistic Regression only.
- No hyperparameter search.
- No alternative architectures (VAE, denoising AE, contractive AE) — these go in README "future work" only.
- No new dependencies beyond `requirements.txt` without flagging it first.
- Do not commit: `data/raw/creditcard.csv`, `models/*.pth`, `models/*.pkl`, `models/*.onnx`, `models/*.json`.
- Do not `git push` unless the user explicitly asks.

## Engineering guardrails

1. **Think before coding.** State assumptions; if multiple interpretations exist, surface them. If something is unclear, ask — don't improvise.
2. **Simplicity first.** Minimum code that solves the problem. No speculative abstractions, no error handling for impossible scenarios.
3. **Surgical changes.** Touch only what the task requires. Match existing style. Don't refactor adjacent code. Remove imports/vars/functions that *your* changes orphaned; leave pre-existing dead code alone unless asked.
4. **Goal-driven.** Each task already has a verify step — use it as the success criterion. Loop until it passes.

## When something breaks

1. **Log it in `DEVLOG.md`** (date, phase, symptom, root cause, resolution, commit).
2. Fix it in a dedicated `fix:` commit — never silently patch it inside an unrelated task's commit.
3. If a previous task's checkbox was wrong, uncheck it; don't pretend it worked.

## Pointers

- `CONTEXT.md` — v1 project spec, locked-in decisions, success criteria.
- `WORKFLOW.md` — detailed conventions, commit message format, end-of-phase protocol.
- `tasks/PHASES.md` — v1 roadmap and status.
- `tasks/PHASE_N_*.md` — v1 current phase's task checklist.
- `DEVLOG.md` — running log of issues and resolutions.

## v2 demo project

The same repo also contains v2 — a static in-browser demo built on v1's artifacts. If the user indicates v2 work (mentions "v2", "demo", `demo/`, GitHub Pages, ONNX Runtime Web, etc.), switch session-start protocol to:

1. Read `CONTEXT-v2.md` in full.
2. Read `tasks/v2/PHASES.md`.
3. Read the current v2 phase file in `tasks/v2/PHASE_N_*.md`.
4. Run `git log -n 20 --oneline --decorate` and `git log -n 5 --stat`.
5. State which v2 phase you're working on and which tasks are unchecked.
6. Wait for the user to confirm before starting any task.

All execution rules above (one task = one commit, conventional commits, never check a box for unverified work) apply identically to v2. The v2 demo lives in `demo/`; the asset export script lives in `src/export_demo_assets.py` (added in v2 Phase 1, not part of v1).
