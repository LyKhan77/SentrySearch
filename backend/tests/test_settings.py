from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_get_settings():
    response = client.get("/api/settings")
    assert response.status_code == 200
    assert "model" in response.json()


def test_update_settings():
    payload = {"model": "qwen3-vl", "chunk_duration": 20, "overlap": 5}
    response = client.put("/api/settings", json=payload)
    assert response.status_code == 200
    assert response.json()["chunk_duration"] == 20
