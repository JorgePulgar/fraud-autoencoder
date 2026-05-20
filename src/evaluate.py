import json
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)

from src.config import Config
from src.model import Autoencoder


def compute_reconstruction_errors(
    model: nn.Module, X: np.ndarray, device: torch.device
) -> np.ndarray:
    model.eval()
    tensor = torch.tensor(X, dtype=torch.float32).to(device)
    with torch.no_grad():
        recon = model(tensor)
    return ((recon - tensor) ** 2).mean(dim=1).cpu().numpy()


def select_threshold(errors_val: np.ndarray, y_val: np.ndarray) -> dict:
    threshold_p99 = float(np.percentile(errors_val[y_val == 0], 99))

    precision, recall, thresholds = precision_recall_curve(y_val, errors_val)
    denom = precision[:-1] + recall[:-1]
    f1_scores = np.where(denom > 0, 2 * precision[:-1] * recall[:-1] / denom, 0.0)
    best_idx = int(np.argmax(f1_scores))
    threshold_f1 = float(thresholds[best_idx])

    y_pred_p99 = (errors_val >= threshold_p99).astype(int)
    f1_at_p99 = float(f1_score(y_val, y_pred_p99, zero_division=0))

    result = {
        "threshold_p99": threshold_p99,
        "threshold_f1": threshold_f1,
        "f1_at_p99": f1_at_p99,
        "f1_at_f1_threshold": float(f1_scores[best_idx]),
    }

    Config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(Config.MODELS_DIR / "threshold.json", "w") as fh:
        json.dump(result, fh, indent=2)

    return result


def compute_metrics_at_threshold(
    errors: np.ndarray, y_true: np.ndarray, threshold: float
) -> dict:
    y_pred = (errors >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return {
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
    }


def compute_threshold_independent_metrics(
    errors: np.ndarray, y_true: np.ndarray
) -> dict:
    return {
        "pr_auc": float(average_precision_score(y_true, errors)),
        "roc_auc": float(roc_auc_score(y_true, errors)),
    }


def evaluate(config) -> None:
    from src.utils import set_seeds
    from src.data import prepare_data
    from src.baselines import train_isolation_forest, train_logistic_regression

    set_seeds(config.RANDOM_SEED)
    data = prepare_data(config.RANDOM_SEED)

    X_train_full  = data["X_train_full"]
    y_train_full  = data["y_train_full"]
    X_train_legit = data["X_train_legit"]
    X_val         = data["X_val"]
    y_val         = data["y_val"]
    X_test        = data["X_test"]
    y_test        = data["y_test"]

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = Autoencoder(config.INPUT_DIM, config.HIDDEN_DIMS).to(device)
    model.load_state_dict(torch.load(config.MODELS_DIR / "autoencoder.pth", map_location=device))

    errors_val  = compute_reconstruction_errors(model, X_val,  device)
    errors_test = compute_reconstruction_errors(model, X_test, device)

    thresholds = select_threshold(errors_val, y_val)
    threshold  = thresholds["threshold_f1"]

    ae_test_metrics  = compute_metrics_at_threshold(errors_test, y_test, threshold)
    ae_auc_metrics   = compute_threshold_independent_metrics(errors_test, y_test)

    iso_model = train_isolation_forest(X_train_legit)
    iso_scores = iso_model.score(X_test)
    iso_auc = compute_threshold_independent_metrics(iso_scores, y_test)

    lr_model  = train_logistic_regression(X_train_full, y_train_full)
    lr_scores = lr_model.score(X_test)
    lr_auc    = compute_threshold_independent_metrics(lr_scores, y_test)

    scores_dict = {
        "Autoencoder":         errors_test,
        "Isolation Forest":    iso_scores,
        "Logistic Regression": lr_scores,
    }

    table = (
        "| Model | Precision | Recall | F1 | PR-AUC | ROC-AUC |\n"
        "|---|---|---|---|---|---|\n"
        f"| Autoencoder (F1-opt threshold) "
        f"| {ae_test_metrics['precision']:.4f} "
        f"| {ae_test_metrics['recall']:.4f} "
        f"| {ae_test_metrics['f1']:.4f} "
        f"| {ae_auc_metrics['pr_auc']:.4f} "
        f"| {ae_auc_metrics['roc_auc']:.4f} |\n"
        f"| Isolation Forest "
        f"| — | — | — "
        f"| {iso_auc['pr_auc']:.4f} "
        f"| {iso_auc['roc_auc']:.4f} |\n"
        f"| Logistic Regression "
        f"| — | — | — "
        f"| {lr_auc['pr_auc']:.4f} "
        f"| {lr_auc['roc_auc']:.4f} |\n"
    )

    print("\n" + table)

    config.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    (config.REPORTS_DIR / "results.md").write_text(table)

    config.FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    plot_error_distribution(errors_test, y_test, threshold, config.FIGURES_DIR / "error_distribution.png")
    plot_pr_curve(scores_dict, y_test, config.FIGURES_DIR / "pr_curve.png")
    plot_roc_curve(scores_dict, y_test, config.FIGURES_DIR / "roc_curve.png")
    plot_confusion_matrix(ae_test_metrics, config.FIGURES_DIR / "confusion_matrix.png")

    print(f"Threshold (F1-opt): {threshold:.6f}")
    print(f"Autoencoder PR-AUC: {ae_auc_metrics['pr_auc']:.4f}")
    print(f"Autoencoder ROC-AUC: {ae_auc_metrics['roc_auc']:.4f}")
    print("Saved reports/results.md and all figures.")
