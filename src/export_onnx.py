import torch

from src.config import Config
from src.model import Autoencoder


def export_to_onnx(
    model_path: str = str(Config.MODELS_DIR / "autoencoder.pth"),
    output_path: str = str(Config.MODELS_DIR / "autoencoder.onnx"),
) -> None:
    model = Autoencoder(Config.INPUT_DIM, Config.HIDDEN_DIMS)
    model.load_state_dict(torch.load(model_path, map_location="cpu", weights_only=True))
    model.eval()

    dummy_input = torch.randn(1, Config.INPUT_DIM)

    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
        opset_version=17,
    )
    print(f"ONNX model saved to {output_path}")
