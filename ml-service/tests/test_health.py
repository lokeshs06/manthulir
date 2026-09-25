import json

from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)


def test_health_reports_mock_mode_and_class_count():
    # Asserted against the active settings/labels file rather than
    # hardcoded values — this test previously assumed no .env was present
    # (mock_model defaulting True, a fixed class count), which broke the
    # moment a developer's local .env legitimately set MOCK_MODEL=false for
    # real end-to-end testing. Whatever's actually configured should be
    # reported correctly, in mock mode or not.
    with open(settings.labels_path, encoding="utf-8") as f:
        expected_num_classes = len(json.load(f)["labels"])

    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["mockMode"] == settings.mock_model
    assert body["modelLoaded"] is True
    assert body["numClasses"] == expected_num_classes
