import torch
import torch.nn as nn


class Autoencoder(nn.Module):
    def __init__(self, input_dim: int = 30, hidden_dims: list[int] | None = None):
        super().__init__()
        if hidden_dims is None:
            hidden_dims = [20, 14, 7, 14, 20]

        dims = [input_dim] + hidden_dims + [input_dim]
        layers: list[nn.Module] = []
        for i, (in_d, out_d) in enumerate(zip(dims[:-1], dims[1:])):
            layers.append(nn.Linear(in_d, out_d))
            if i < len(dims) - 2:
                layers.append(nn.ReLU())

        self.net = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)
