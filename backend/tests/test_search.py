from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_search_endpoint():
    query = "red truck"
    response = client.get(f"/api/search?q={query}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        item = data[0]
        assert "id" in item
        assert "title" in item
        assert "thumbnailUrl" in item
        assert "score" in item
        assert "duration" in item
        assert "timestamp" in item
        assert isinstance(item["id"], str)
        assert isinstance(item["title"], str)
        assert isinstance(item["score"], float)
