import copy
import csv

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
from torch import optim
from torch.utils.data import DataLoader, TensorDataset


def make_dataloader(X: np.ndarray, batch_size: int, shuffle: bool) -> DataLoader:
    tensor = torch.tensor(X, dtype=torch.float32)
    return DataLoader(TensorDataset(tensor), batch_size=batch_size, shuffle=shuffle)


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    optimizer: optim.Optimizer,
    device: torch.device,
) -> float:
    model.train()
    criterion = nn.MSELoss()
    total_loss = 0.0
    for (batch,) in loader:
        batch = batch.to(device)
        optimizer.zero_grad()
        loss = criterion(model(batch), batch)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * len(batch)
    return total_loss / len(loader.dataset)


def evaluate_loss(model: nn.Module, loader: DataLoader, device: torch.device) -> float:
    model.eval()
    criterion = nn.MSELoss()
    total_loss = 0.0
    with torch.no_grad():
        for (batch,) in loader:
            batch = batch.to(device)
            total_loss += criterion(model(batch), batch).item() * len(batch)
    return total_loss / len(loader.dataset)


def train(config) -> None:
    from src.utils import set_seeds
    from src.data import prepare_data
    from src.model import Autoencoder

    set_seeds(config.RANDOM_SEED)
    data = prepare_data(config.RANDOM_SEED)

    X_train_legit = data["X_train_legit"]
    X_val = data["X_val"]
    y_val = data["y_val"]
    X_val_legit = X_val[y_val == 0]

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_loader = make_dataloader(X_train_legit, config.BATCH_SIZE, shuffle=True)
    val_loader = make_dataloader(X_val_legit, config.BATCH_SIZE, shuffle=False)

    model = Autoencoder(config.INPUT_DIM, config.HIDDEN_DIMS).to(device)
    optimizer = optim.Adam(model.parameters(), lr=config.LR)

    best_val_loss = float("inf")
    best_state = None
    best_epoch = 0
    patience_counter = 0
    train_losses, val_losses = [], []

    for epoch in range(1, config.MAX_EPOCHS + 1):
        tr_loss = train_one_epoch(model, train_loader, optimizer, device)
        vl_loss = evaluate_loss(model, val_loader, device)
        train_losses.append(tr_loss)
        val_losses.append(vl_loss)
        print(f"Epoch {epoch:3d} | train={tr_loss:.6f} | val={vl_loss:.6f}")

        if vl_loss < best_val_loss:
            best_val_loss = vl_loss
            best_epoch = epoch
            best_state = copy.deepcopy(model.state_dict())
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= config.EARLY_STOPPING_PATIENCE:
                print(f"Early stopping at epoch {epoch} (patience={config.EARLY_STOPPING_PATIENCE})")
                break

    config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    torch.save(best_state, config.MODELS_DIR / "autoencoder.pth")

    config.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    log_path = config.REPORTS_DIR / "training_log.csv"
    with open(log_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["epoch", "train_loss", "val_loss"])
        for i, (tr, vl) in enumerate(zip(train_losses, val_losses), start=1):
            writer.writerow([i, tr, vl])

    config.FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    fig, ax = plt.subplots(figsize=(8, 4))
    epochs = range(1, len(train_losses) + 1)
    ax.plot(epochs, train_losses, label="train")
    ax.plot(epochs, val_losses, label="val")
    ax.axvline(best_epoch, color="red", linestyle="--", label=f"best epoch ({best_epoch})")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("MSE Loss")
    ax.set_title("Training Curves")
    ax.legend()
    fig.tight_layout()
    fig.savefig(config.FIGURES_DIR / "training_curves.png", dpi=100)
    plt.close(fig)

    print(f"\nBest epoch: {best_epoch} | Best val loss: {best_val_loss:.6f}")


if __name__ == "__main__":
    from src.config import Config
    train(Config)
