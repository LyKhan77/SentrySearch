from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_get_history():
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        item = data[0]
        assert "id" in item
        assert "query" in item
        assert "timestamp" in item
        assert "results_count" in item
        assert "best_score" in item
        assert "top_result" in item
        assert isinstance(item["id"], int)
        assert isinstance(item["query"], str)
        assert isinstance(item["timestamp"], str)
        assert isinstance(item["results_count"], int)
        assert isinstance(item["best_score"], float)
