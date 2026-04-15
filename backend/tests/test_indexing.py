from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_start_indexing() -> None:
    response = client.post("/api/index/start", json={"folder_path": "/tmp/vids"})

    assert response.status_code == 200
    assert "job_id" in response.json()
