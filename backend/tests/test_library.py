# backend/tests/test_library.py
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_library():
    response = client.get("/api/library")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        item = data[0]
        assert "id" in item
        assert "name" in item
        assert "duration" in item
        assert "size" in item
        assert "status" in item
        assert item["status"] in ["indexed", "indexing", "error"]
