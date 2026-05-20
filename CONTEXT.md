# Project Context

**Read this file at the start of every Claude Code session.**

## What this project is

A class project for the Master's in AI and Data Engineering at Tajamar. The exercise requires applying a GAN or Autoencoder to a freely chosen use case. Deadline: 2 days. Secondary goal: this doubles as an AI Engineering portfolio piece, so engineering quality and reproducibility matter as much as model performance.

## Use case (one-sentence justification)

Credit card fraud detection framed as **unsupervised anomaly detection**: train an autoencoder only on legitimate transactions and flag anomalies via reconstruction error. This mirrors the realistic production scenario where fraud patterns evolve faster than labeled data arrives.

## Why an autoencoder and not a supervised classifier

This is the project's key intellectual decision and must appear in the README and video. The honest framing:

> On this static labeled dataset, tuned supervised methods (XGBoost) will likely outperform the autoencoder on raw F1. But autoencoders are the right tool when fraud patterns evolve and labeled fraud is scarce — which is the realistic production scenario. This project deliberately models the unsupervised case.

This framing turns a potential weakness ("supervised would beat you") into a thoughtful design decision.

## Dataset

- **Source:** Kaggle "Credit Card Fraud Detection" (Machine Learning Group - ULB)
- **URL:** https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
- **Format:** Single CSV (`creditcard.csv`), ~150 MB, 284,807 rows × 31 columns
- **Columns:** `Time`, `V1`–`V28` (PCA-anonymized features), `Amount`, `Class` (0 = legit, 1 = fraud)
- **Imbalance:** ~0.17% fraud (492 fraud / 284,315 legit)
- **Local location:** `data/raw/creditcard.csv` (gitignored, user downloads manually)

## Tech stack (locked-in decisions)

- **Language:** Python 3.10+
- **DL framework:** PyTorch (CPU is fine; GPU optional)
- **Other libs:** scikit-learn (splits, scaler, baselines, metrics), pandas, numpy, matplotlib, seaborn, onnx, onnxruntime, jupyter
- **No** Streamlit, Gradio, FastAPI in this phase. Deployment is a separate v2 project.
- **No** SMOTE / oversampling — the whole point of using an autoencoder is to avoid label-dependent rebalancing.

## Architecture (locked-in)

Symmetric fully-connected autoencoder, ONNX-export-friendly:

- **Layers:** `30 → 20 → 14 → 7 → 14 → 20 → 30`
- **Input:** 30 features (V1–V28, Time, Amount — all scaled). The `Class` column is dropped before feeding the model.
- **Activations:** ReLU in hidden layers, no activation on output (regression to original values)
- **Building blocks:** `nn.Linear`, `nn.ReLU`, `nn.Sequential` only
- **No** batch norm (complicates ONNX export and inference-time behavior)
- **Dropout:** optional 0.1 in encoder only, if at all

## Training (locked-in)

- Train on training-set **legitimate** transactions only
- Loss: MSE
- Optimizer: Adam, lr=1e-3
- Batch size: 256
- Epochs: 50 max, early stopping on validation reconstruction loss (patience=5)
- Validation loss computed on legitimate subset of val set only

## Evaluation (locked-in)

- Reconstruction errors = per-sample MSE across the 30 features
- Threshold selection on **validation set**:
  - Method A: 99th percentile of reconstruction errors on validation legitimate transactions
  - Method B: threshold that maximizes F1 on full validation set
  - Report both; use Method B for the final test evaluation
- Test metrics: precision, recall, F1, accuracy, confusion matrix, PR-AUC, ROC-AUC
- Baselines for comparison: Isolation Forest (contamination=0.0017), Logistic Regression (class_weight='balanced')

## Reproducibility requirements

- Seeds set everywhere: `numpy`, `torch`, `random`, sklearn `random_state=42`
- All hyperparameters in `src/config.py`
- Every script runnable from project root: `python -m src.train`, `python -m src.evaluate`, etc.
- Stratified train/val/test split: 70/15/15, stratified by `Class` (fraud must appear in val and test)
- StandardScaler fit on training-set legitimate transactions only (no leakage)

## Repository structure (locked-in)

```
fraud-autoencoder/
├── CLAUDE.md                  # Always-loaded behavior for Claude Code
├── CONTEXT.md                 # This file
├── WORKFLOW.md                # Session protocol for Claude Code (detailed)
├── DEVLOG.md                  # Running log of issues + resolutions
├── README.md                  # Project README (built in Phase 6)
├── requirements.txt
├── .gitignore                 # data/, models/, __pycache__/, .venv/, *.onnx initially
├── tasks/
│   ├── PHASES.md              # Roadmap diagram
│   ├── PHASE_1_setup.md       # Phase task lists
│   ├── PHASE_2_data.md
│   ├── PHASE_3_model.md
│   ├── PHASE_4_evaluation.md
│   ├── PHASE_5_export.md
│   └── PHASE_6_finalize.md
├── data/
│   └── raw/                   # creditcard.csv goes here (gitignored)
├── models/                    # Saved artifacts (gitignored)
├── notebooks/
│   ├── 01_eda.ipynb
│   └── 02_results.ipynb
├── src/
│   ├── __init__.py
│   ├── config.py              # Hyperparameters, paths, seeds
│   ├── data.py                # Load, split, scale
│   ├── model.py               # Autoencoder class
│   ├── train.py               # Training script (CLI)
│   ├── evaluate.py            # Evaluation script (CLI)
│   ├── baselines.py           # Isolation Forest + Logistic Regression
│   └── export_onnx.py         # Export trained model to ONNX
└── reports/
    └── figures/               # Plots: training curves, error distributions, PR/ROC curves
```

## Success criteria

- `python -m src.train && python -m src.evaluate` runs end-to-end from a fresh clone (assuming CSV is in place)
- Test set PR-AUC ≥ 0.70 (ambitious target; the autoencoder achieves 0.37 — see DEVLOG 2026-05-20 for why this gap is expected and not a defect)
- ONNX export passes a numerical sanity check (max diff vs PyTorch < 1e-5)
- README is publishable as-is to a portfolio
- Every task has its own atomic commit with a clear message
- Every checked box in a phase file corresponds to actually-verified working code

## Out of scope (do not build)

- Live demo (Gradio, Streamlit, FastAPI, browser-side ONNX) — this is a separate v2 project to be built after class submission
- Hyperparameter search
- Multiple architectures (VAE, denoising AE, contractive AE) — these are README "future work" only
- SMOTE / oversampling
- XGBoost or other supervised gradient-boosted baselines (mentioned in README only)

## Author context (for tone in README)

The author is Jorge Pulgar, a Junior AI Engineer based in Madrid. The README's primary language is English. A short Spanish summary (3–5 lines) appears at the bottom. The tone is professional, technically honest, and direct — no marketing fluff, no overclaiming. License: MIT.
