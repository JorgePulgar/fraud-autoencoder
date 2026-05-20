from dataclasses import dataclass, field
from pathlib import Path

_ROOT = Path(__file__).parent.parent


@dataclass(frozen=True)
class _Config:
    # Paths
    DATA_PATH: Path = _ROOT / "data" / "raw" / "creditcard.csv"
    MODELS_DIR: Path = _ROOT / "models"
    REPORTS_DIR: Path = _ROOT / "reports"
    FIGURES_DIR: Path = _ROOT / "reports" / "figures"

    # Seeds
    RANDOM_SEED: int = 42

    # Split ratios
    TRAIN_RATIO: float = 0.70
    VAL_RATIO: float = 0.15
    TEST_RATIO: float = 0.15

    # Model architecture
    INPUT_DIM: int = 30
    HIDDEN_DIMS: list = field(default_factory=lambda: [20, 14, 7, 14, 20])

    # Training
    LR: float = 1e-3
    BATCH_SIZE: int = 256
    MAX_EPOCHS: int = 200
    EARLY_STOPPING_PATIENCE: int = 5

    # Evaluation
    THRESHOLD_PERCENTILE: int = 99


Config = _Config()
