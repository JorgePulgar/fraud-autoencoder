import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


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
