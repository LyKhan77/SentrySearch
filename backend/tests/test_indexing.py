import uuid

import pytest
from fastapi.testclient import TestClient

from backend.api import indexing as indexing_api
from backend.main import app


client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_index_jobs():
    indexing_api.jobs.clear()
    indexing_api.job_tasks.clear()
    yield
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
