# Phase 3 — Model & Training

**Goal:** Implement the autoencoder, the training loop with early stopping, and produce a saved model artifact ready for evaluation.

**Depends on:** Phase 2.

**Estimated time:** 1.5–2 hours (training itself: 1–3 minutes on CPU).

## Pre-session checklist

- [ ] Phase 2 is fully complete.
- [ ] `models/scaler.pkl` exists from Phase 2.

## Tasks

- [x] **Task 3.1** — In `src/model.py`, implement the `Autoencoder` class as a `torch.nn.Module`. Use the architecture defined in `CONTEXT.md`:
  - Encoder: `Linear(30, 20) → ReLU → Linear(20, 14) → ReLU → Linear(14, 7) → ReLU`
  - Decoder: `Linear(7, 14) → ReLU → Linear(14, 20) → ReLU → Linear(20, 30)`
  - No batch norm, no dropout (keeping it ONNX-clean)
  - `forward(x)` must be a straight `Sequential` call — no `if`/`else` based on tensor values
  Verify with a dummy forward pass: `Autoencoder()(torch.randn(4, 30)).shape == (4, 30)`.
  - Commit: `feat(model): implement symmetric autoencoder`

- [ ] **Task 3.2** — In `src/train.py`, implement `make_dataloader(X: np.ndarray, batch_size: int, shuffle: bool) -> DataLoader` that wraps a numpy array into a `TensorDataset` + `DataLoader`. Use `torch.float32`.
  - Commit: `feat(train): add dataloader helper`

- [ ] **Task 3.3** — In `src/train.py`, implement the `train_one_epoch(model, loader, optimizer, device) -> float` function that runs one epoch and returns the average training loss.
  - Commit: `feat(train): add single-epoch training step`

- [ ] **Task 3.4** — In `src/train.py`, implement `evaluate_loss(model, loader, device) -> float` that runs in `torch.no_grad()` and returns average MSE over the loader.
  - Commit: `feat(train): add validation loss evaluation`

- [ ] **Task 3.5** — In `src/train.py`, implement the main `train(config) -> None` function that orchestrates everything:
  1. Call `set_seeds(config.RANDOM_SEED)`
  2. Call `prepare_data(config.RANDOM_SEED)`
  3. Build legit-only val loader: `X_val_legit = X_val[y_val == 0]`
  4. Build train and val loaders
  5. Instantiate `Autoencoder()`, `Adam` optimizer
  6. Training loop with early stopping on val loss (patience from config)
  7. Save best model state_dict to `models/autoencoder.pth`
  8. Log per-epoch train/val losses to `reports/training_log.csv`
  9. Plot training curves, save to `reports/figures/training_curves.png`
  10. Print final summary: best epoch, best val loss
  - Commit: `feat(train): add main training orchestration`

- [ ] **Task 3.6** — Add a `if __name__ == "__main__":` block at the bottom of `src/train.py` that calls `train(Config)`. Verify the module is runnable as `python -m src.train` from project root.
  - Commit: `feat(train): add CLI entrypoint`

- [ ] **Task 3.7** — Run `python -m src.train` end-to-end. Verify:
  - Training completes (either hits max epochs or triggers early stopping)
  - `models/autoencoder.pth` is created and non-empty
  - `reports/training_log.csv` exists with per-epoch losses
  - `reports/figures/training_curves.png` exists and looks reasonable (val loss decreasing then plateauing)
  - Final val loss is below 1.0 (sanity check — anything above suggests a bug)
  - Commit: `chore(train): verify end-to-end training run`

## Definition of done for Phase 3

- `python -m src.train` runs end-to-end without errors in under 5 minutes on CPU.
- `models/autoencoder.pth` exists.
- Training curves PNG looks like a sensible learning curve.
- All boxes above are checked.

## End-of-phase commit

- Commit: `chore(phase-3): complete phase 3 model and training`
- Update `PHASES.md` to check off Phase 3.
- Commit: `docs(phases): mark phase 3 as complete`
