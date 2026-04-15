from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_stream_video_not_found():
    response = client.get("/api/video/stream/non-existent.mp4")
    assert response.status_code == 404
    assert response.json()["error"] == "Video not found"

def test_stream_video_success():
    import os
    os.makedirs("backend/assets", exist_ok=True)
    with open("backend/assets/test.mp4", "wb") as f:
        f.write(b"mock video data")

    response = client.get("/api/video/stream/test.mp4")
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
