import numpy as np
import onnxruntime as ort
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


def verify_onnx_export(
    pytorch_model_path: str = str(Config.MODELS_DIR / "autoencoder.pth"),
    onnx_model_path: str = str(Config.MODELS_DIR / "autoencoder.onnx"),
) -> None:
    model = Autoencoder(Config.INPUT_DIM, Config.HIDDEN_DIMS)
    model.load_state_dict(torch.load(pytorch_model_path, map_location="cpu", weights_only=True))
    model.eval()

    torch.manual_seed(0)
    X = torch.randn(8, Config.INPUT_DIM)

    with torch.no_grad():
        pytorch_output = model(X).numpy()

    session = ort.InferenceSession(onnx_model_path)
    onnx_output = session.run(["output"], {"input": X.numpy()})[0]

    max_diff = np.max(np.abs(pytorch_output - onnx_output))
    print(f"Max absolute difference (PyTorch vs ONNX): {max_diff:.2e}")
    assert max_diff < 1e-5, f"Numerical mismatch: {max_diff:.2e} >= 1e-5"
    print("Verification passed.")
