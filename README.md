# fraud-autoencoder

Unsupervised credit card fraud detection using a reconstruction-error autoencoder trained exclusively on legitimate transactions.

![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Live demo

**[fraud-autoencoder — In-Browser Demo](https://JorgePulgar.github.io/fraud-autoencoder/)**

The interactive face of this project. Run the trained autoencoder entirely in your browser — no server, no install, no data leaving your device. Try the 6 preset transactions (3 legit, 3 fraud), enter custom feature values manually, or upload a CSV batch. Drag the threshold slider to see how classification changes in real time.

Built with React + Vite + ONNX Runtime Web and hosted on GitHub Pages. Source in [`demo/`](demo/).

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
└── reports/
    ├── results.md             # Comparison table
    └── figures/               # Training curves, error distribution, PR/ROC curves
```

---

## Key technical decisions

- **Symmetric FC autoencoder `30→20→14→7→14→20→30`** — fully connected, ReLU hidden activations, linear output; no batch norm or dropout, which keeps the ONNX export simple and the inference behaviour deterministic.
- **StandardScaler fit on training-set legitimate transactions only** — no data leakage; the scaler never sees validation or test data, and never sees fraud labels.
- **Stratified 70/15/15 train/val/test split** — fraud cases appear in all three splits, so validation and test metrics are meaningful despite the severe imbalance.
- **Threshold selected on validation set to maximise F1** — two thresholds are reported (99th-pct of legitimate val errors, and F1-optimised); the F1-optimised threshold is used for final test evaluation.
- **Baselines: Isolation Forest (`contamination=0.0017`) and Logistic Regression (`class_weight='balanced'`)** — one unsupervised, one supervised, bracketing the expected performance range.

---

## Future work

- **Supervised baseline: XGBoost** — to establish the full performance ceiling on this dataset
- **Variational / denoising autoencoder** — a tighter learned latent manifold would reduce false-positive reconstruction errors on unusual-but-legitimate transactions
- **Cost-sensitive threshold tuning** — replace F1-optimal threshold with one derived from a financial cost matrix (cost of a missed fraud >> cost of a false alarm)
- **Concept-drift handling** — periodic retraining on a rolling window of confirmed-legitimate transactions

---

## License

MIT — see [LICENSE](LICENSE).

---

## Author

**Jorge Pulgar** — Junior AI Engineer, Madrid

- GitHub: [github.com/jpulgar](https://github.com/jpulgar)
- LinkedIn: [linkedin.com/in/jpulgar](https://linkedin.com/in/jpulgar)

---

## Resumen en español

Este proyecto aplica un autoencoder para detectar fraude en tarjetas de crédito de forma no supervisada: el modelo se entrena únicamente con transacciones legítimas y marca como sospechosas aquellas que no consigue reconstruir bien. El conjunto de datos es el de Kaggle "Credit Card Fraud Detection" (ULB), con 284.807 transacciones y un desequilibrio extremo del 0,17% de fraude. El modelo alcanza PR-AUC 0,37 y ROC-AUC 0,92 sin acceso a ninguna etiqueta durante el entrenamiento. El enfoque no supervisado es la elección deliberada del proyecto: en producción real, los patrones de fraude evolucionan más rápido de lo que llegan las etiquetas, y un autoencoder puede detectar cualquier desviación del comportamiento legítimo sin necesidad de ejemplos previos de fraude.
