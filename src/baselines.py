import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression


class _IsoForestWrapper:
    def __init__(self, model: IsolationForest):
        self._model = model

    def score(self, X: np.ndarray) -> np.ndarray:
        return -self._model.decision_function(X)


class _LogRegWrapper:
    def __init__(self, model: LogisticRegression):
        self._model = model

    def score(self, X: np.ndarray) -> np.ndarray:
        return self._model.predict_proba(X)[:, 1]


def train_logistic_regression(
    X_train_full: np.ndarray, y_train_full: np.ndarray
) -> _LogRegWrapper:
    lr = LogisticRegression(
        class_weight="balanced", random_state=42, max_iter=1000
    )
    lr.fit(X_train_full, y_train_full)
    return _LogRegWrapper(lr)


def train_isolation_forest(X_train_legit: np.ndarray) -> _IsoForestWrapper:
    iso = IsolationForest(
        contamination=0.0017, random_state=42, n_estimators=100
    )
    iso.fit(X_train_legit)
    return _IsoForestWrapper(iso)
