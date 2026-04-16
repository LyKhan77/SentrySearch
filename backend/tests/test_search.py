from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_search_endpoint(monkeypatch):
    from backend.api import search as search_api

    def mock_search_footage(query, store, n_results=10, threshold=0.0):
        return [
            {
                "id": "1",
                "source_file": "/tmp/test.mp4",
                "start_time": 0.0,
                "end_time": 10.0,
                "similarity_score": 0.95,
                "indexed_at": "2026-04-15",
            }
        ]

    monkeypatch.setattr(search_api, "search_footage", mock_search_footage)
    monkeypatch.setattr(search_api, "SentryStore", lambda **kwargs: None)

    query = "red truck"
    response = client.get(f"/api/search?q={query}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    item = data[0]
    assert item["id"] == "1"
    assert item["score"] == 0.95
