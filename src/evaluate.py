import json
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
)

from src.config import Config


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
