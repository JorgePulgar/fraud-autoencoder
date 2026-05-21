"""Export static demo assets from v1 artifacts into demo/public/.

Usage:
    python -m src.export_demo_assets [--out demo/public/] [--verify]
"""
import argparse
import json
import shutil
from pathlib import Path

import joblib
import numpy as np
import onnxruntime as ort

from src.config import Config
from src.data import load_raw_data, split_data

ROOT = Path(__file__).parent.parent

FEATURE_ORDER = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount"]


def _load_artifacts():
    scaler = joblib.load(Config.MODELS_DIR / "scaler.pkl")
    with open(Config.MODELS_DIR / "threshold.json") as f:
        threshold = json.load(f)
    session = ort.InferenceSession(str(Config.MODELS_DIR / "autoencoder.onnx"))
    return scaler, threshold, session


def _load_splits():
    df = load_raw_data(str(Config.DATA_PATH))
    splits = split_data(df, Config.RANDOM_SEED)
    return splits


def _write_scaler_json(out_dir: Path, scaler) -> None:
    payload = {
        "mean": scaler.mean_.tolist(),
        "scale": scaler.scale_.tolist(),
        "feature_order": FEATURE_ORDER,
    }
    (out_dir / "scaler.json").write_text(json.dumps(payload))
    print(f"  wrote scaler.json ({len(payload['mean'])} features)")


def main(out_dir: Path, verify: bool = False) -> None:
    print("Loading v1 artifacts...")
    scaler, threshold, session = _load_artifacts()
    print(f"  scaler mean shape : {scaler.mean_.shape}")
    print(f"  threshold keys    : {list(threshold.keys())}")
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    print(f"  onnx input        : {input_name}  {session.get_inputs()[0].shape}")
    print(f"  onnx output       : {output_name} {session.get_outputs()[0].shape}")

    print("Loading test split...")
    splits = _load_splits()
    X_test, y_test = splits["X_test"], splits["y_test"]
    print(f"  X_test shape      : {X_test.shape}")
    print(f"  y_test distribution: legit={(y_test==0).sum()}  fraud={(y_test==1).sum()}")

    print("Writing artifacts...")
    out_dir.mkdir(parents=True, exist_ok=True)
    _write_scaler_json(out_dir, scaler)

    if verify:
        _run_verify(out_dir, scaler, threshold, session)


def _run_verify(out_dir: Path, scaler, threshold, session) -> None:
    input_name = session.get_inputs()[0].name

    # scaler.json
    scaler_path = out_dir / "scaler.json"
    with open(scaler_path) as f:
        sj = json.load(f)
    assert len(sj["mean"]) == 30, "scaler mean length != 30"
    assert len(sj["scale"]) == 30, "scaler scale length != 30"
    assert sj["feature_order"] == FEATURE_ORDER, "feature_order mismatch"
    mean = np.array(sj["mean"])
    scale = np.array(sj["scale"])
    row = np.random.default_rng(0).standard_normal((1, 30))
    ts_scaled = (row - mean) / scale
    sk_scaled = scaler.transform(row)
    diff = np.abs(ts_scaled - sk_scaled).max()
    assert diff < 1e-10, f"scaler diff {diff} exceeds tolerance"
    print("  scaler.json       : OK")

    # threshold.json
    thr_path = out_dir / "threshold.json"
    with open(thr_path) as f:
        tj = json.load(f)
    assert "threshold_p99" in tj and "threshold_f1" in tj, "threshold.json missing keys"
    print("  threshold.json    : OK")

    # autoencoder.onnx
    onnx_path = out_dir / "autoencoder.onnx"
    sess2 = ort.InferenceSession(str(onnx_path))
    x = np.zeros((1, 30), dtype=np.float32)
    out = sess2.run(None, {sess2.get_inputs()[0].name: x})[0]
    assert out.shape == (1, 30), f"onnx output shape {out.shape} != (1, 30)"
    print("  autoencoder.onnx  : OK")

    # presets.json
    presets_path = out_dir / "presets.json"
    with open(presets_path) as f:
        presets = json.load(f)
    assert len(presets) == 6, f"presets count {len(presets)} != 6"
    labels = [p["true_label"] for p in presets]
    assert labels.count(0) == 3 and labels.count(1) == 3, "presets label distribution wrong"
    assert all(p["ae_error"] > 0 for p in presets), "ae_error <= 0"
    print("  presets.json      : OK")

    # histogram-data.json
    hist_path = out_dir / "histogram-data.json"
    with open(hist_path) as f:
        hj = json.load(f)
    samples = hj["samples"]
    n_fraud = sum(1 for s in samples if s["label"] == 1)
    n_legit = sum(1 for s in samples if s["label"] == 0)
    assert n_legit == 500, f"legit samples {n_legit} != 500"
    assert n_fraud >= 1, f"no fraud samples in histogram"
    assert all(s["error"] > 0 for s in samples), "histogram error <= 0"
    print("  histogram-data.json: OK")

    print("\nAll checks passed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export demo assets for v2.")
    parser.add_argument("--out", type=Path, default=ROOT / "demo" / "public",
                        help="Output directory (default: demo/public/)")
    parser.add_argument("--verify", action="store_true",
                        help="Re-read and sanity-check all emitted artifacts")
    args = parser.parse_args()
    main(args.out, args.verify)
