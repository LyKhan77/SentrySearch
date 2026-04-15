import asyncio
import uuid
import json
from concurrent.futures import Future
import threading

from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse


router = APIRouter()


class IndexRequest(BaseModel):
    folder_path: str


jobs: dict[str, dict[str, object]] = {}
job_tasks: dict[str, Future[None]] = {}

_background_loop: asyncio.AbstractEventLoop | None = None
_background_thread: threading.Thread | None = None
_background_loop_ready = threading.Event()
_background_loop_lock = threading.Lock()


def _run_background_loop() -> None:
    global _background_loop

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    _background_loop = loop
    _background_loop_ready.set()
    loop.run_forever()


def get_background_loop() -> asyncio.AbstractEventLoop:
    global _background_thread

    with _background_loop_lock:
        if (
            _background_loop is not None
            and _background_thread is not None
            and _background_thread.is_alive()
        ):
            return _background_loop

        _background_loop_ready.clear()
        _background_thread = threading.Thread(
            target=_run_background_loop,
            name="mock-indexing-loop",
            daemon=True,
        )
        _background_thread.start()

    _background_loop_ready.wait()
    assert _background_loop is not None
    return _background_loop


def reconcile_job_task(job_id: str, task: Future[None]) -> None:
    job_tasks.pop(job_id, None)

    job = jobs.get(job_id)
    if job is None:
        return

    if task.cancelled():
        job["cancelled"] = True
        job["status"] = "cancelled"
        job["eta"] = "stopped"
        job["done"] = True
        return

    error = task.exception()
    if error is not None:
        job["status"] = "failed"
        job["eta"] = "error"
        job["done"] = True


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


def index_job_not_found(job_id: str) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={
            "error": "Index job not found",
            "details": f"Job {job_id} does not exist in the current session",
            "code": 404,
        },
    )


async def progress_events(job_id: str):
    while True:
        job = jobs.get(job_id)
        if job is None:
            # This should be handled by the caller, but just in case
            break

        yield {
            "data": json.dumps(
                {
                    "progress": job["progress"],
                    "status": job["status"],
                    "eta": job["eta"],
                    "done": job["done"],
                    "cancelled": job["cancelled"],
                }
            )
        }

        if job["done"] or job["cancelled"]:
            break

        await asyncio.sleep(0.1)


@router.get("/index/progress/{job_id}")
async def get_indexing_progress(job_id: str):
    if job_id not in jobs:
        return index_job_not_found(job_id)

    return EventSourceResponse(progress_events(job_id))


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
    task = asyncio.run_coroutine_threadsafe(
        run_mock_indexing_task(job_id),
        get_background_loop(),
    )
    job_tasks[job_id] = task
    task.add_done_callback(
        lambda finished_task: reconcile_job_task(job_id, finished_task)
    )
    return {"job_id": job_id}
