import numpy as np
from sklearn.ensemble import IsolationForest


class _IsoForestWrapper:
    def __init__(self, model: IsolationForest):
        self._model = model

    def score(self, X: np.ndarray) -> np.ndarray:
        return -self._model.decision_function(X)


def train_isolation_forest(X_train_legit: np.ndarray) -> _IsoForestWrapper:
    iso = IsolationForest(
        contamination=0.0017, random_state=42, n_estimators=100
    )
    iso.fit(X_train_legit)
    return _IsoForestWrapper(iso)
