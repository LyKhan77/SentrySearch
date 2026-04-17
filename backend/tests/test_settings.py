import pytest
from fastapi.testclient import TestClient
from backend.api import settings as settings_api
from backend.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_env(monkeypatch):
    import os
    from backend.api import settings as settings_api

    # Mock default environment variables (local copy for each test)
    env_data = {
        "EMBEDDING_BACKEND": "qwen3-vl",
        "EMBEDDING_MODEL": "qwen3-vl",
        "CHUNK_DURATION": "15",
        "OVERLAP": "3",
        "GEMINI_API_KEY": None,
    }

    def mock_getenv(key, default=None):
        return env_data.get(key, default)

    def mock_set_key(path, key, value):
        env_data[key] = value

    monkeypatch.setattr(os, "getenv", mock_getenv)
    monkeypatch.setattr(settings_api, "set_key", mock_set_key)
    monkeypatch.setattr(settings_api, "load_dotenv", lambda *args, **kwargs: None)
    yield


def test_get_settings():
    response = client.get("/api/settings")
    assert response.status_code == 200
    assert response.json()["model"] == "qwen3-vl"


def test_update_settings():
    payload = {
        "model": "qwen3-vl",
        "chunk_duration": 20,
        "overlap": 5,
        "gemini_api_key": "test-key",
    }
    response = client.put("/api/settings", json=payload)
    assert response.status_code == 200

    # Should return what was sent
    assert response.json()["chunk_duration"] == 20
    assert response.json()["gemini_api_key"] == "test-key"

    persisted_response = client.get("/api/settings")
    assert persisted_response.status_code == 200
    # Settings() reads from mock env which was updated by mock_set_key
    data = persisted_response.json()
    assert data["model"] == "qwen3-vl"
    assert data["chunk_duration"] == 20
    assert data["overlap"] == 5


def test_get_settings_starts_with_defaults():
    response = client.get("/api/settings")
    assert response.status_code == 200
    assert response.json()["model"] == "qwen3-vl"
    assert response.json()["chunk_duration"] == 15
    assert response.json()["overlap"] == 3


def test_get_settings_includes_active_backend(monkeypatch):
    """Test that active_backend is returned from embedder (not from detect_index)."""

    def mock_get_current_backend():
        return "local"  # Simulate local model is active

    def mock_get_fallback_status():
        return {
            "is_using_fallback": False,
            "fallback_reason": None,
            "configured_backend": "local",
            "active_backend": "local",
        }

    monkeypatch.setattr(
        "sentrysearch.embedder.get_current_backend", mock_get_current_backend
    )
    monkeypatch.setattr(
        "sentrysearch.embedder.get_fallback_status", mock_get_fallback_status
    )

    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert "active_backend" in data
    # active_backend should come from embedder ("local"), not from ENV ("gemini")
    assert data["active_backend"] == "local"
