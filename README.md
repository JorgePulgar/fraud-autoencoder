# fraud-autoencoder

Unsupervised credit card fraud detection using a reconstruction-error autoencoder trained exclusively on legitimate transactions.

![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Deploy](https://github.com/JorgePulgar/fraud-autoencoder/actions/workflows/deploy-demo.yml/badge.svg)

🇪🇸 **[Leer en español](README.es.md)**

---

## Live demo

<p align="center">
  <a href="https://JorgePulgar.github.io/fraud-autoencoder/">
    <img src="demo/src/assets/hero.png" alt="fraud-autoencoder live demo" width="320">
  </a>
</p>

<p align="center">
  <strong><a href="https://JorgePulgar.github.io/fraud-autoencoder/">→ Try the in-browser demo</a></strong>
</p>

The interactive face of this project. Run the trained autoencoder entirely in your browser — no server, no install, no data leaving your device. Try the 6 preset transactions (3 legit, 3 fraud), enter custom feature values manually, or upload a CSV batch. Drag the threshold slider to see how classification changes in real time.

Built with React + Vite + ONNX Runtime Web, hosted on GitHub Pages. Source in [`demo/`](demo/).

---

## TL;DR

- **What:** an autoencoder that flags fraudulent credit card transactions by training only on *legitimate* ones and measuring how badly each new transaction reconstructs.
- **Why this framing:** in production, fraud evolves faster than labels arrive — a model that needs labeled fraud examples is brittle by design. An autoencoder only needs examples of normal behaviour.
- **Result:** PR-AUC **0.37** vs **0.11** for Isolation Forest (~3× the unsupervised baseline). A supervised Logistic Regression hits **0.79** — that gap is the expected, documented cost of going label-free.
- **Engineering:** reproducible end-to-end pipeline, ONNX export with numerical sanity check (<1e-5), and a static in-browser demo on GitHub Pages running the exact same model client-side.

---

## Key features

- **Unsupervised by design** — the model never sees fraud during training; anomalies are detected purely from reconstruction error.
- **No data leakage** — `StandardScaler` fit on legitimate training rows only, enforced by an in-code assertion.
- **Honest evaluation** — stratified 70/15/15 split, two threshold strategies reported (99th-pct of legit val errors, F1-optimal), PR-AUC as the primary metric (correct choice on a 0.17%-positive dataset).
- **Brackets the performance range** — Isolation Forest (unsupervised) below, Logistic Regression (supervised, balanced class weights) above.
- **Production-shaped export** — trained model exported to ONNX and verified numerically against PyTorch (max diff < 1e-5).
- **Static in-browser demo** — same model, same preprocessing, running client-side on GitHub Pages. No backend, no data egress.
- **Reproducible by construction** — fixed seeds across NumPy / PyTorch / Python / scikit-learn, all hyperparameters in `src/config.py`, every script runnable from project root.
- **Atomic commit history** — phase-driven development, one task = one commit, decisions logged in [`DEVLOG.md`](DEVLOG.md).

---

## Table of contents

1. [Live demo](#live-demo)
2. [TL;DR](#tldr)
3. [Key features](#key-features)
4. [Project summary](#project-summary)
5. [Results](#results)
6. [Why an autoencoder?](#why-an-autoencoder)
7. [How it works](#how-it-works)
8. [Implementation notes](#implementation-notes)
9. [How to reproduce](#how-to-reproduce)
10. [Project structure](#project-structure)
11. [Key technical decisions](#key-technical-decisions)
12. [Future work](#future-work)
13. [License](#license)
14. [Author](#author)

---

## Project summary

This project applies an autoencoder to the Kaggle Credit Card Fraud Detection dataset (284,807 transactions, 492 fraud cases — 0.17% imbalance). The model is trained only on legitimate transactions and flags anomalies via reconstruction error: transactions the model cannot reconstruct well are marked as potential fraud.

On the held-out test set the autoencoder achieves **PR-AUC 0.37 / ROC-AUC 0.92** with zero exposure to fraud labels during training. A supervised Logistic Regression baseline reaches PR-AUC 0.79 — that gap is expected and intentional (see [Why an autoencoder?](#why-an-autoencoder) below). The project is designed as a class exercise and portfolio piece for AI Engineering roles, prioritising engineering quality, reproducibility, and intellectual honesty over benchmark scores.

---

## Results

Test set evaluation (stratified 15% holdout, threshold selected on validation set):

| Model | Precision | Recall | F1 | PR-AUC | ROC-AUC |
|---|---|---|---|---|---|
| **Autoencoder** (F1-opt threshold) | 0.3469 | 0.4595 | 0.3953 | 0.3668 | 0.9228 |
| Isolation Forest | — | — | — | 0.1140 | 0.9479 |
| Logistic Regression | — | — | — | 0.7928 | 0.9677 |

Precision/Recall/F1 for the baselines are omitted — they require a separately calibrated decision threshold, which is outside their standard evaluation protocol. PR-AUC and ROC-AUC, computed from raw scores, are the fair threshold-independent comparison.

---

## Why an autoencoder?

On this static labeled dataset, a tuned supervised method (Logistic Regression, XGBoost) will outperform the autoencoder on raw F1. **That is expected and intentional.**

The autoencoder is the right tool for the realistic production scenario:

- Fraud patterns evolve faster than labeled data arrives. New attack vectors have zero labeled examples at first.
- An autoencoder trained on legitimate behaviour generalises to *any* deviation, not just known fraud patterns.
- No labels are required at training time — the model can be retrained continuously on the growing stream of confirmed-legitimate transactions.

A supervised classifier fixes a decision boundary at training time. When fraud patterns shift, it degrades silently. This project deliberately models the unsupervised case to make that tradeoff visible.

The ROC-AUC of **0.92** (vs. 0.97 for Logistic Regression) shows that the model has strong ranking quality with zero label access. The PR-AUC gap is the documented, expected cost of the unsupervised choice.

[⬆ Back to top](#fraud-autoencoder)

---

## How it works

An autoencoder is a neural network that learns to **compress its input through a narrow bottleneck and then reconstruct it**. The architecture used here is symmetric: `30 → 20 → 14 → 7 → 14 → 20 → 30`. Thirty input features (V1–V28 plus `Time` and `Amount`) are squeezed into 7 latent units, then expanded back to 30.

The trick: the model is trained **only on legitimate transactions**, with mean squared error between input and reconstruction as the loss. Because the bottleneck cannot hold all the original information, the network is forced to learn the most informative latent structure of *normal* behaviour — and only normal behaviour.

At inference, every new transaction is passed through the network and the reconstruction error (mean squared error across the 30 features) becomes the anomaly score:

- **Low error** → the transaction looks like patterns the model learned during training → likely legitimate.
- **High error** → the transaction deviates from the legitimate manifold → likely fraud.

A threshold over that score turns it into a binary decision. Because the model has never seen fraud during training, it generalises to *any* anomalous behaviour, not just patterns from previously labeled attacks.

[⬆ Back to top](#fraud-autoencoder)

---

## Implementation notes

Subtle but important details that don't fit into a one-line description:

- **Frauds in the training split are deliberately excluded.** After the stratified 70/15/15 split, the training set contains roughly 344 fraud rows. Those are dropped before training. Including them would let the network learn to reconstruct fraud too, collapsing the very signal we rely on at inference. This filtering is enforced and asserted in `src/data.py`.
- **Validation loss is computed on legitimate val rows only.** Early stopping watches reconstruction loss on the legit subset of validation, not the full validation set. If we included fraud rows, the network would be penalised for correctly *failing* to reconstruct them — exactly the wrong signal.
- **PR-AUC is the primary metric, not ROC-AUC or accuracy.** With 0.17% positive rate, ROC-AUC is inflated by the overwhelming number of easy true negatives, and accuracy is meaningless (a constant "legit" prediction scores 99.83%). PR-AUC reflects precision and recall on the rare positive class and is the honest comparison.
- **Threshold tuning never touches the test set.** Both thresholds (99th-percentile of legit val errors, and F1-optimal) are selected on validation, then frozen before any test-set evaluation runs.
- **ONNX export is numerically verified.** `src/export_onnx.py` exports the trained PyTorch model to ONNX and checks that ONNX-Runtime outputs match PyTorch outputs to within 1e-5 on the validation set. Without that check, "we have an ONNX file" is not the same as "we have a working ONNX model."
- **The browser demo runs the exact same artifacts.** The `demo/` app loads the same `.onnx` model and the same scaler statistics (exported as JSON) that the Python evaluation script uses. Inference happens entirely client-side via ONNX Runtime Web.
- **Engineering discipline is part of the deliverable.** Development followed a phase-by-phase plan (`tasks/PHASES.md`), one task per atomic commit with conventional messages (`feat:`, `fix:`, `docs:`, etc.). Issues encountered during the build are documented in [`DEVLOG.md`](DEVLOG.md). The intent is that a reviewer can read the git log and reconstruct the entire decision history.

[⬆ Back to top](#fraud-autoencoder)

---

## How to reproduce

```bash
git clone <repo-url>
cd fraud-autoencoder
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Download creditcard.csv from Kaggle and place it at:
# data/raw/creditcard.csv
# https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud

python -m src.train
python -m src.evaluate
python -m src.export_onnx
```

Scripts are runnable from the project root. All hyperparameters live in `src/config.py`. Seeds are fixed (`random_state=42`) for full reproducibility.

Expected wall-clock times on CPU: `train` ~5 min (86 epochs, early stop), `evaluate` ~20 s, `export_onnx` ~3 s.

[⬆ Back to top](#fraud-autoencoder)

---

## Project structure

```
fraud-autoencoder/
├── CLAUDE.md                  # Always-loaded behavior for Claude Code
├── CONTEXT.md                 # Project spec and locked-in decisions
├── WORKFLOW.md                # Session protocol for Claude Code
├── DEVLOG.md                  # Running log of issues and resolutions
├── README.md
├── requirements.txt
├── .gitignore
├── tasks/
│   ├── PHASES.md              # Roadmap
│   └── PHASE_N_*.md           # Phase task checklists
├── data/
│   └── raw/                   # creditcard.csv (gitignored — download manually)
├── models/                    # Saved artifacts (gitignored)
├── notebooks/
│   ├── 01_eda.ipynb           # Exploratory data analysis
│   └── 02_results.ipynb       # Results, figures, and analysis
├── src/
│   ├── config.py              # Hyperparameters, paths, seeds
│   ├── data.py                # Load, split, scale
│   ├── model.py               # Autoencoder architecture
│   ├── train.py               # Training script
│   ├── evaluate.py            # Evaluation script
│   ├── baselines.py           # Isolation Forest + Logistic Regression
│   └── export_onnx.py         # ONNX export and numerical verification
├── demo/                      # In-browser demo (React + ONNX Runtime Web)
└── reports/
    ├── results.md             # Comparison table
    └── figures/               # Training curves, error distribution, PR/ROC curves
```

[⬆ Back to top](#fraud-autoencoder)

---

## Key technical decisions

- **Symmetric FC autoencoder `30→20→14→7→14→20→30`** — fully connected, ReLU hidden activations, linear output; no batch norm or dropout, which keeps the ONNX export simple and the inference behaviour deterministic.
- **Bottleneck of 7 units** — compresses 30 features ~4.3×, forcing the network to learn the structure of legitimate behaviour rather than memorise it.
- **MSE reconstruction loss, Adam optimiser (lr=1e-3), batch size 256** — the simplest defensible setup for a regression-style reconstruction objective.
- **Early stopping (patience=5) on legit-only validation loss** — see [Implementation notes](#implementation-notes).
- **StandardScaler fit on training-set legitimate transactions only** — no data leakage; the scaler never sees validation or test data, and never sees fraud labels.
- **Stratified 70/15/15 train/val/test split** — fraud cases appear in all three splits, so validation and test metrics are meaningful despite the severe imbalance.
- **Two threshold strategies reported** — 99th-percentile of legit val errors (production-style, fixed review budget) and F1-optimised (best precision/recall tradeoff). F1-optimised is used for the headline test number.
- **Baselines: Isolation Forest (`contamination=0.0017`) and Logistic Regression (`class_weight='balanced'`)** — one unsupervised, one supervised, bracketing the expected performance range.

[⬆ Back to top](#fraud-autoencoder)

---

## Future work

- **Supervised baseline: XGBoost** — to establish the full performance ceiling on this dataset
- **Variational / denoising autoencoder** — a tighter learned latent manifold would reduce false-positive reconstruction errors on unusual-but-legitimate transactions
- **Cost-sensitive threshold tuning** — replace F1-optimal threshold with one derived from a financial cost matrix (cost of a missed fraud >> cost of a false alarm)
- **Concept-drift handling** — periodic retraining on a rolling window of confirmed-legitimate transactions
- **Seed ensemble of autoencoders** — average reconstruction errors across multiple seeds to reduce score variance on rare events

[⬆ Back to top](#fraud-autoencoder)

---

## License

MIT — see [LICENSE](LICENSE).

[⬆ Back to top](#fraud-autoencoder)

---

## Author

**Jorge Pulgar** — Junior AI Engineer, Madrid

- GitHub: [github.com/jpulgar](https://github.com/jpulgar)
- LinkedIn: [linkedin.com/in/jpulgar](https://linkedin.com/in/jpulgar)

[⬆ Back to top](#fraud-autoencoder)
