import hashlib
import json
import random
from pathlib import Path

from PIL import Image

from app.config import Settings

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
INPUT_SIZE = 224


def _load_labels(labels_path: str) -> list[str]:
    path = Path(labels_path)
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f).get("labels", [])


class PestClassifier:
    """Wraps either a real TorchScript model or a deterministic mock, behind
    the same predict() interface, so the API never has to branch on mode."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.labels = _load_labels(settings.labels_path)
        self.is_loaded = False
        self._model = None
        self._transform = None

        if settings.mock_model:
            # Mock mode needs no model weights at all — this lets the Node
            # API be built and tested before any model is trained.
            self.is_loaded = True
            return

        self._load_real_model()

    def _load_real_model(self) -> None:
        try:
            import torch
            from torchvision import transforms

            model_path = Path(self.settings.model_path)
            if not model_path.exists():
                return

            self._model = torch.jit.load(str(model_path), map_location="cpu")
            self._model.eval()
            self._transform = transforms.Compose(
                [
                    transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
                ]
            )
            self.is_loaded = True
        except Exception:
            # Loading failures degrade to "model not loaded" rather than
            # crashing the service — /health reports it, /predict returns 503.
            self.is_loaded = False

    def predict(self, image: Image.Image, raw_bytes: bytes) -> list[dict]:
        if self.settings.mock_model:
            return self._mock_predict(raw_bytes)
        return self._real_predict(image)

    def _mock_predict(self, raw_bytes: bytes) -> list[dict]:
        if not self.labels:
            return []

        # Deterministic per-image "prediction" (same image -> same result),
        # without needing any trained weights.
        seed = int(hashlib.md5(raw_bytes).hexdigest(), 16) % (2**32)
        rng = random.Random(seed)

        k = min(3, len(self.labels))
        indices = rng.sample(range(len(self.labels)), k=k)

        top = rng.uniform(0.55, 0.95)
        raw_confidences = [top]
        for _ in range(1, k):
            raw_confidences.append(raw_confidences[-1] * rng.uniform(0.3, 0.7))

        return [
            {"label": self.labels[idx], "confidence": round(conf, 4)}
            for idx, conf in zip(indices, raw_confidences)
        ]

    def _real_predict(self, image: Image.Image) -> list[dict]:
        import torch

        if not self.is_loaded:
            raise RuntimeError("Model is not loaded")

        tensor = self._transform(image).unsqueeze(0)
        with torch.no_grad():
            logits = self._model(tensor)
            probabilities = torch.softmax(logits, dim=1)[0]
            top_probs, top_indices = torch.topk(probabilities, k=min(3, len(self.labels)))

        return [
            {"label": self.labels[idx], "confidence": round(prob.item(), 4)}
            for prob, idx in zip(top_probs, top_indices)
        ]
