import pandas as pd


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
