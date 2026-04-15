import asyncio
import uuid

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class IndexRequest(BaseModel):
    folder_path: str


jobs: dict[str, dict[str, object]] = {}
job_tasks: dict[str, asyncio.Task] = {}


async def run_mock_indexing_task(job_id: str) -> None:
    await asyncio.sleep(0.01)
    await run_mock_indexing(job_id)


async def run_mock_indexing(job_id: str) -> None:
    for progress, status, eta in [
        (25, "Scanning files", "3m left"),
        (60, "Embedding chunks", "2m left"),
        (100, "Completed", "done"),
    ]:
        job = jobs.get(job_id)
        if job is None or job["cancelled"]:
            return
        await asyncio.sleep(0.05)
        job["progress"] = progress
        job["status"] = status
        job["eta"] = eta

    job = jobs.get(job_id)
    if job is not None and not job["cancelled"]:
        job["done"] = True


@router.post("/index/start")
async def start_indexing(req: IndexRequest) -> dict[str, str]:
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "folder_path": req.folder_path,
        "progress": 0,
        "status": "queued",
        "eta": "pending",
        "done": False,
        "cancelled": False,
    }
    job_tasks[job_id] = asyncio.create_task(run_mock_indexing_task(job_id))
    return {"job_id": job_id}
