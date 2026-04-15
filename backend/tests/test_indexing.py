import uuid
import time

import pytest
from fastapi.testclient import TestClient

from backend.api import indexing as indexing_api
from backend.main import app


client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_index_jobs():
    for task in list(indexing_api.job_tasks.values()):
        task.cancel()
    indexing_api.jobs.clear()
    indexing_api.job_tasks.clear()
    yield
    for task in list(indexing_api.job_tasks.values()):
        task.cancel()
    indexing_api.jobs.clear()
    indexing_api.job_tasks.clear()


def test_start_indexing_returns_uuid_and_tracks_job(monkeypatch):
    async def fake_run_mock_indexing(job_id: str):
        indexing_api.jobs[job_id]["status"] = "completed"
        indexing_api.jobs[job_id]["progress"] = 100
        indexing_api.jobs[job_id]["eta"] = "done"
        indexing_api.jobs[job_id]["done"] = True

    monkeypatch.setattr(indexing_api, "run_mock_indexing", fake_run_mock_indexing)

    response = client.post("/api/index/start", json={"folder_path": "/tmp/vids"})

    assert response.status_code == 200
    job_id = response.json()["job_id"]
    uuid.UUID(job_id)
    assert indexing_api.jobs[job_id]["folder_path"] == "/tmp/vids"
    assert indexing_api.jobs[job_id]["progress"] == 0
    assert indexing_api.jobs[job_id]["status"] == "queued"
    assert job_id in indexing_api.job_tasks


def test_start_indexing_progresses_outside_request_lifecycle():
    response = client.post("/api/index/start", json={"folder_path": "/tmp/vids"})

    assert response.status_code == 200
    job_id = response.json()["job_id"]

    deadline = time.monotonic() + 1.0
    while time.monotonic() < deadline:
        job = indexing_api.jobs[job_id]
        if job["done"]:
            break
        time.sleep(0.02)

    job = indexing_api.jobs[job_id]
    assert job["progress"] == 100
    assert job["status"] == "Completed"
    assert job["eta"] == "done"
    assert job["done"] is True
    assert job_id not in indexing_api.job_tasks


def test_failed_indexing_task_marks_job_failed(monkeypatch):
    async def fake_run_mock_indexing(_: str):
        raise RuntimeError("boom")

    monkeypatch.setattr(indexing_api, "run_mock_indexing", fake_run_mock_indexing)

    response = client.post("/api/index/start", json={"folder_path": "/tmp/vids"})

    assert response.status_code == 200
    job_id = response.json()["job_id"]

    deadline = time.monotonic() + 1.0
    while time.monotonic() < deadline:
        job = indexing_api.jobs[job_id]
        if job["status"] == "failed" and job_id not in indexing_api.job_tasks:
            break
        time.sleep(0.02)

    job = indexing_api.jobs[job_id]
    assert job["status"] == "failed"
    assert job["eta"] == "error"
    assert job["done"] is True
    assert job_id not in indexing_api.job_tasks


def test_progress_stream_returns_sse_event():
    response = client.post("/api/index/start", json={"folder_path": "/tmp/vids"})
    job_id = response.json()["job_id"]

    with client.stream("GET", f"/api/index/progress/{job_id}") as response:
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"
        
        # We just need the first event to verify it works
        for line in response.iter_lines():
            if line.startswith("data: "):
                import json
                data = json.loads(line[len("data: "):])
                assert "progress" in data
                assert "status" in data
                assert "eta" in data
                assert "done" in data
                break


def test_progress_stream_returns_404_for_unknown_job():
    unknown_id = str(uuid.uuid4())
    response = client.get(f"/api/index/progress/{unknown_id}")
    
    assert response.status_code == 404
    assert response.json() == {
        "error": "Index job not found",
        "details": f"Job {unknown_id} does not exist in the current session",
        "code": 404
    }
