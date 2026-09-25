import io

from fastapi.testclient import TestClient
from PIL import Image

from app.config import settings
from app.main import app

client = TestClient(app)


def make_jpeg_bytes(color="red", size=(32, 32)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color=color).save(buf, format="JPEG")
    return buf.getvalue()


def test_predict_requires_internal_key():
    res = client.post("/predict", files={"file": ("pest.jpg", make_jpeg_bytes(), "image/jpeg")})
    assert res.status_code == 401


def test_predict_rejects_wrong_internal_key():
    res = client.post(
        "/predict",
        files={"file": ("pest.jpg", make_jpeg_bytes(), "image/jpeg")},
        headers={"X-Internal-Key": "wrong-key"},
    )
    assert res.status_code == 401


def test_predict_returns_top3_mock_predictions():
    res = client.post(
        "/predict",
        files={"file": ("pest.jpg", make_jpeg_bytes(), "image/jpeg")},
        headers={"X-Internal-Key": settings.internal_api_key},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["modelVersion"] == settings.model_version
    assert isinstance(body["inferenceMs"], float)
    assert 1 <= len(body["predictions"]) <= 3
    for pred in body["predictions"]:
        assert "label" in pred
        assert 0 <= pred["confidence"] <= 1


def test_predict_is_deterministic_for_the_same_image():
    headers = {"X-Internal-Key": settings.internal_api_key}
    image_bytes = make_jpeg_bytes(color="blue")

    res1 = client.post("/predict", files={"file": ("a.jpg", image_bytes, "image/jpeg")}, headers=headers)
    res2 = client.post("/predict", files={"file": ("b.jpg", image_bytes, "image/jpeg")}, headers=headers)

    assert res1.json()["predictions"] == res2.json()["predictions"]


def test_predict_rejects_non_image_file():
    res = client.post(
        "/predict",
        files={"file": ("notes.txt", b"just some text, not an image", "text/plain")},
        headers={"X-Internal-Key": settings.internal_api_key},
    )
    assert res.status_code == 400


def test_predict_rejects_files_over_the_size_limit():
    oversized = b"\x00" * (settings.max_upload_mb * 1024 * 1024 + 1)
    res = client.post(
        "/predict",
        files={"file": ("huge.jpg", oversized, "image/jpeg")},
        headers={"X-Internal-Key": settings.internal_api_key},
    )
    assert res.status_code == 413
