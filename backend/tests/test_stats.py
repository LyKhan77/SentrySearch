from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_videos" in data
    assert "total_chunks" in data
    assert "vector_db_size" in data
    assert "total_footage_duration" in data
    assert isinstance(data["total_videos"], int)
    assert isinstance(data["total_chunks"], int)
    assert isinstance(data["vector_db_size"], str)
    assert isinstance(data["total_footage_duration"], str)
