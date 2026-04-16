import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_trim_video_success():
    src = "backend/assets/vids/carCrash.mp4"
    if not os.path.exists(src):
        pytest.skip("carCrash.mp4 not available")

    response = client.get(
        "/api/video/trim/carCrash.mp4",
        params={"start": 9.0, "end": 10.0, "padding": 1.0},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert len(response.content) > 1024


def test_trim_video_not_found():
    response = client.get(
        "/api/video/trim/non-existent.mp4",
        params={"start": 0, "end": 5},
    )
    assert response.status_code == 404


def test_trim_video_invalid_range():
    response = client.get(
        "/api/video/trim/carCrash.mp4",
        params={"start": 10.0, "end": 5.0},
    )
    assert response.status_code == 400
