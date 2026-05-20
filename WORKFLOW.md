# Workflow Instructions for Claude Code

**Read this file at the start of every session, before doing anything else.**

## Session start protocol

At the start of every session, do the following in order:

1. **Read `CONTEXT.md`** in full — this is the project's source of truth.
2. **Read `tasks/PHASES.md`** — understand where this phase fits in the overall plan.
3. **Read the phase file for the current session** (e.g., `tasks/PHASE_2_data.md`) — this is your task list.
4. **Read the last 15–20 git commits** with: `git log -n 20 --oneline --decorate` and, for the most recent 5 commits, `git log -n 5 --stat`.
5. **State out loud** (in chat) which phase you're about to work on and which tasks are still unchecked.
6. **Wait for the user's confirmation** before starting any task.

## Task execution rules

- **One task = one commit.** Never bundle multiple tasks into a single commit.
- After completing a task:
  1. Verify it works (run the relevant script, test, or check)
  2. Stage and commit with a clear conventional-commit message: `feat: ...`, `chore: ...`, `docs: ...`, `fix: ...`, `test: ...`, `refactor: ...`
  3. Edit the phase file: change `- [ ]` to `- [x]` for the completed task
  4. Commit the phase file update separately with message: `docs(phase-N): mark task X as done`
  5. Report back to the user with a one-line summary of what changed
  6. Pause and wait for the user to say "next" before continuing

- **Never check a box for a task that isn't actually verified to work.** A passing import is not a passing test.
- **If a task is unclear or seems wrong**, stop and ask. Do not improvise.

## Commit message conventions

Format: `<type>(<scope>): <subject>`

Examples:
- `feat(data): add stratified train/val/test split`
- `feat(model): implement symmetric autoencoder architecture`
- `chore(repo): scaffold folder structure`
- `docs(readme): add reproducibility instructions`
- `test(data): verify no class leakage in splits`
- `fix(train): correct early stopping patience logic`
- `docs(phase-2): mark task 4 as done`

## When you finish a phase

After the last task of a phase is checked off:
1. Commit any final state with `chore(phase-N): complete phase N`
2. Print a phase summary: what was built, what files changed, key decisions made
3. Tell the user: "Phase N complete. Ready to start Phase N+1 in a new session."

## Things you must NOT do

- Do not skip ahead to tasks in later phases.
- Do not delete or rewrite checked-off tasks.
- Do not commit the dataset (`data/raw/creditcard.csv`), trained models (`models/*.pth`, `*.pkl`), or the ONNX file.
- Do not add dependencies that aren't in `requirements.txt` without flagging it first.
- Do not run `git push` unless the user asks — local commits only.

## If something goes wrong

- **Step 0 — Log it in `DEVLOG.md`.** Append an entry with date, phase, symptom, root cause, resolution, and commit. Do this *before* committing the fix, so the entry references the right commit.
- A test fails → stop, report the error, propose a fix, wait for approval.
- A previous commit looks broken → do not silently fix it in a new task's commit. Make a dedicated `fix:` commit.
- The user changes their mind on a task → uncheck the box, add a new task, commit the spec change with `docs(phase-N): update task list`.
