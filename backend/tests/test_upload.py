import os
import shutil
import time
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.api import upload as upload_api
from backend.api import indexing as indexing_api


client = TestClient(app)

STAGING_ROOT = upload_api.STAGING_DIR


@pytest.fixture(autouse=True)
def cleanup_staging_and_jobs():
    yield
    if os.path.isdir(STAGING_ROOT):
        shutil.rmtree(STAGING_ROOT, ignore_errors=True)
    for task in list(indexing_api.job_tasks.values()):
        task.cancel()
    indexing_api.jobs.clear()
    indexing_api.job_tasks.clear()


def test_upload_single_file_returns_200_and_saves_file():
    content = b"fake video content for test"
    response = client.post(
        "/api/index/upload",
        files={"files": ("test_video.mp4", content, "video/mp4")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "staging_path" in data
    assert os.path.isdir(data["staging_path"])


def test_upload_multiple_files_returns_200():
    files = [
        ("files", ("video1.mp4", b"content1", "video/mp4")),
        ("files", ("video2.mov", b"content2", "video/quicktime")),
    ]
    response = client.post("/api/index/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    saved = os.listdir(data["staging_path"])
    assert len(saved) == 2


def test_upload_rejects_unsupported_extension():
    content = b"not a video"
    response = client.post(
        "/api/index/upload",
        files={"files": ("evil.exe", content, "application/octet-stream")},
    )
    assert response.status_code == 400


def test_upload_and_index_returns_job_id(monkeypatch):
    async def fake_index(job_id: str):
        job = indexing_api.jobs[job_id]
        job["progress"] = 100
        job["status"] = "Completed"
        job["eta"] = "done"
        job["done"] = True

    monkeypatch.setattr(indexing_api, "run_real_indexing", fake_index)

    content = b"fake video content for test"
    response = client.post(
        "/api/index/upload-and-index",
        files={"files": ("test_video.mp4", content, "video/mp4")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert "staging_path" in data
    assert "file_count" in data
    assert data["file_count"] == 1
