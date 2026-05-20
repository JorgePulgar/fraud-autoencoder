import numpy as np
import torch
from torch.utils.data import DataLoader, TensorDataset


def make_dataloader(X: np.ndarray, batch_size: int, shuffle: bool) -> DataLoader:
    tensor = torch.tensor(X, dtype=torch.float32)
    return DataLoader(TensorDataset(tensor), batch_size=batch_size, shuffle=shuffle)
