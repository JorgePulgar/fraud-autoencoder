import numpy as np
import torch
import torch.nn as nn


def compute_reconstruction_errors(
    model: nn.Module, X: np.ndarray, device: torch.device
) -> np.ndarray:
    model.eval()
    tensor = torch.tensor(X, dtype=torch.float32).to(device)
    with torch.no_grad():
        recon = model(tensor)
    return ((recon - tensor) ** 2).mean(dim=1).cpu().numpy()
