import pytest
from fastapi.testclient import TestClient
from backend.api import settings as settings_api
from backend.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_settings():
    settings_api.current_settings = settings_api.Settings()
    yield
    settings_api.current_settings = settings_api.Settings()


def test_get_settings():
    response = client.get("/api/settings")
    assert response.status_code == 200
    assert "model" in response.json()


def test_update_settings():
    payload = {"model": "qwen3-vl", "chunk_duration": 20, "overlap": 5}
    response = client.put("/api/settings", json=payload)
    assert response.status_code == 200
    assert response.json()["chunk_duration"] == 20


def test_get_settings_starts_with_defaults():
    response = client.get("/api/settings")
    assert response.status_code == 200
    assert response.json() == {
        "model": "qwen3-vl",
        "chunk_duration": 15,
        "overlap": 3,
    }
