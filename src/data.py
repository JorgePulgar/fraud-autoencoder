import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from src.config import Config


_EXPECTED_SHAPE = (284807, 31)
_EXPECTED_COLUMNS = {"Time", "Amount", "Class"} | {f"V{i}" for i in range(1, 29)}


def load_raw_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)

    if df.shape != _EXPECTED_SHAPE:
        raise ValueError(
            f"Expected shape {_EXPECTED_SHAPE}, got {df.shape}. "
            "Make sure you are using the correct creditcard.csv from Kaggle."
        )

    missing = _EXPECTED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing expected columns: {sorted(missing)}")

    return df


def split_data(df: pd.DataFrame, seed: int) -> dict:
    X = df.drop(columns=["Class"]).to_numpy()
    y = df["Class"].to_numpy()

    # 70 / 30 first split, then 50/50 on the 30 → 15/15
    X_train_full, X_temp, y_train_full, y_temp = train_test_split(
        X, y, test_size=0.30, stratify=y, random_state=seed
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, stratify=y_temp, random_state=seed
    )

    return {
        "X_train_full": X_train_full,
        "y_train_full": y_train_full,
        "X_val": X_val,
        "y_val": y_val,
        "X_test": X_test,
        "y_test": y_test,
    }


def fit_scaler(X_train_legit: np.ndarray) -> StandardScaler:
    scaler = StandardScaler()
    scaler.fit(X_train_legit)
    return scaler


def apply_scaler(scaler: StandardScaler, X: np.ndarray) -> np.ndarray:
    return scaler.transform(X)


def prepare_data(seed: int) -> dict:
    df = load_raw_data(str(Config.DATA_PATH))
    splits = split_data(df, seed)

    X_train_full = splits["X_train_full"]
    y_train_full = splits["y_train_full"]

    # Fit scaler on legit training rows only — no leakage
    X_train_legit = X_train_full[y_train_full == 0]
    assert X_train_legit.shape[0] == (y_train_full == 0).sum(), (
        "Scaler was fitted on more rows than legit training samples — leakage detected."
    )
    scaler = fit_scaler(X_train_legit)

    Config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(scaler, Config.MODELS_DIR / "scaler.pkl")

    return {
        "X_train_full": apply_scaler(scaler, X_train_full),
        "y_train_full": y_train_full,
        "X_train_legit": apply_scaler(scaler, X_train_legit),
        "X_val": apply_scaler(scaler, splits["X_val"]),
        "y_val": splits["y_val"],
        "X_test": apply_scaler(scaler, splits["X_test"]),
        "y_test": splits["y_test"],
    }
