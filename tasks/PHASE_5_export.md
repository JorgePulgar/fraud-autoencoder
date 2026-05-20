# Phase 5 — ONNX Export

**Goal:** Export the trained autoencoder to ONNX format and verify numerical equivalence with the PyTorch version. This is a sanity check for a future browser-based demo (v2 project) — even if you don't deploy now, catching export issues here is much cheaper than later.

**Depends on:** Phase 3 (only needs the trained model — does NOT require Phase 4).

**Estimated time:** 30 minutes.

**When to run:** Ideally end of Day 1, immediately after Phase 3, before Phase 4. This way if export is broken, you have time to fix it without panic.

## Pre-session checklist

- [ ] Phase 3 is fully complete.
- [ ] `models/autoencoder.pth` exists.

## Tasks

- [ ] **Task 5.1** — In `src/export_onnx.py`, implement `export_to_onnx(model_path: str, output_path: str) -> None` that:
  1. Loads the model from `model_path`
  2. Puts it in `eval()` mode
  3. Creates a dummy input: `torch.randn(1, 30)`
  4. Calls `torch.onnx.export` with:
     - `dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}`
     - `input_names=['input']`, `output_names=['output']`
     - `opset_version=17` (modern, well-supported)
  5. Saves to `output_path` (default: `models/autoencoder.onnx`)
  - Commit: `feat(export): add onnx export function`

- [ ] **Task 5.2** — In the same file, implement `verify_onnx_export(pytorch_model_path, onnx_model_path) -> None` that:
  1. Loads both the PyTorch model and the ONNX model
  2. Creates a fixed test input: `torch.manual_seed(0); X = torch.randn(8, 30)`
  3. Gets predictions from both
  4. Asserts `np.max(np.abs(pytorch_output - onnx_output)) < 1e-5`
  5. Prints the max absolute difference for transparency
  - Commit: `test(export): add onnx numerical verification`

- [ ] **Task 5.3** — Add CLI entrypoint and run `python -m src.export_onnx`. Verify:
  - `models/autoencoder.onnx` is created (small file, a few hundred KB)
  - The verification step prints a max-diff value below 1e-5 and asserts pass
  - Commit: `chore(export): verify onnx export numerical fidelity`

- [ ] **Task 5.4** — Update `.gitignore` to track ONNX as ignored for now (we don't want to commit binary artifacts to the main repo — they'll live in the v2 deployment repo later).
  - Commit: `chore(repo): gitignore onnx artifacts`

## Definition of done for Phase 5

- `python -m src.export_onnx` runs end-to-end and the verification assertion passes.
- `models/autoencoder.onnx` exists locally (but is gitignored).
- All boxes above are checked.

## End-of-phase commit

- Commit: `chore(phase-5): complete phase 5 onnx export`
- Update `PHASES.md` to check off Phase 5.
- Commit: `docs(phases): mark phase 5 as complete`
