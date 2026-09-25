import io
import time

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from app.config import settings
from app.model import PestClassifier
from app.schemas import HealthResponse, PredictResponse
from app.security import verify_internal_key

app = FastAPI(title="Manthulir ML Service", version="0.1.0")

# Loaded once at process startup, not per request.
classifier = PestClassifier(settings)

MAX_UPLOAD_BYTES = settings.max_upload_mb * 1024 * 1024


def _sniff_image_type(data: bytes) -> str | None:
    """Validates by magic bytes rather than trusting the filename/extension."""
    if data[:3] == b"\xff\xd8\xff":
        return "jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        modelLoaded=classifier.is_loaded,
        mockMode=settings.mock_model,
        modelVersion=settings.model_version,
        numClasses=len(classifier.labels),
    )


@app.post("/predict", response_model=PredictResponse, dependencies=[Depends(verify_internal_key)])
async def predict(file: UploadFile = File(...)):
    data = await file.read()

    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_upload_mb}MB limit")

    if _sniff_image_type(data) is None:
        raise HTTPException(status_code=400, detail="File is not a valid JPEG, PNG, or WebP image")

    try:
        image = Image.open(io.BytesIO(data)).convert("RGB")
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="Could not decode image") from exc

    if not classifier.is_loaded:
        raise HTTPException(status_code=503, detail="Model is not currently loaded")

    start = time.perf_counter()
    predictions = classifier.predict(image, raw_bytes=data)
    inference_ms = (time.perf_counter() - start) * 1000

    return PredictResponse(
        predictions=predictions,
        modelVersion=settings.model_version,
        inferenceMs=round(inference_ms, 2),
    )
