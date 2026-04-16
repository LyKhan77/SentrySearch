import asyncio
import uuid
import json
import os
import shutil
from concurrent.futures import Future
import threading

from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse

from sentrysearch.chunker import chunk_video, scan_directory, preprocess_chunk, is_still_frame_chunk
from sentrysearch.embedder import get_embedder, reset_embedder
from sentrysearch.store import SentryStore


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
            name="indexing-loop",
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
        job["status"] = f"failed: {error}"
        job["eta"] = "error"
        job["done"] = True


async def run_real_indexing(job_id: str) -> None:
    job = jobs.get(job_id)
    if not job:
        return

    try:
        directory = job["folder_path"]
        backend = os.getenv("EMBEDDING_BACKEND", "gemini")
        model = os.getenv("EMBEDDING_MODEL")
        chunk_duration = int(os.getenv("CHUNK_DURATION", "30"))
        overlap = int(os.getenv("OVERLAP", "5"))
        
        embedder = get_embedder(backend, model=model)
        store = SentryStore(backend=backend, model=model)
        
        videos = scan_directory(directory) if not os.path.isfile(directory) else [os.path.abspath(directory)]
        if not videos:
            job["status"] = f"Error: No supported videos found in {directory}"
            job["done"] = True
            return

        total_files = len(videos)
        for file_idx, video_path in enumerate(videos, 1):
            if job["cancelled"]:
                break
                
            abs_path = os.path.abspath(video_path)
            basename = os.path.basename(video_path)
            
            job["status"] = f"Processing {basename} ({file_idx}/{total_files})"
            job["progress"] = int((file_idx - 1) / total_files * 100)

            if store.is_indexed(abs_path):
                continue

            chunks = chunk_video(abs_path, chunk_duration=chunk_duration, overlap=overlap)
            num_chunks = len(chunks)
            embedded = []
            files_to_cleanup = []

            for chunk_idx, chunk in enumerate(chunks, 1):
                if job["cancelled"]:
                    break
                
                job["status"] = f"Indexing {basename}: Chunk {chunk_idx}/{num_chunks}"
                
                if is_still_frame_chunk(chunk["chunk_path"]):
                    files_to_cleanup.append(chunk["chunk_path"])
                    continue

                embed_path = chunk["chunk_path"]
                # For UI simplicity, we'll always preprocess if it's Gemini
                if backend == "gemini":
                    embed_path = preprocess_chunk(embed_path)
                    if embed_path != chunk["chunk_path"]:
                        files_to_cleanup.append(embed_path)

                embedding = embedder.embed_video_chunk(embed_path)
                embedded.append({**chunk, "embedding": embedding})
                files_to_cleanup.append(chunk["chunk_path"])

            # Cleanup
            for f in files_to_cleanup:
                try: os.unlink(f)
                except: pass
            if chunks:
                shutil.rmtree(os.path.dirname(chunks[0]["chunk_path"]), ignore_errors=True)

            if embedded:
                store.add_chunks(embedded)

        if not job["cancelled"]:
            job["progress"] = 100
            job["status"] = "Completed"
            job["done"] = True

    except Exception as e:
        job["status"] = f"Error: {str(e)}"
        job["done"] = True
    finally:
        reset_embedder()


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


@router.post("/index/cancel/{job_id}")
async def cancel_indexing(job_id: str):
    if job_id not in jobs:
        return index_job_not_found(job_id)

    job = jobs[job_id]
    job["cancelled"] = True
    job["status"] = "cancelled"
    job["eta"] = "stopped"
    job["done"] = True

    task = job_tasks.pop(job_id, None)
    if task:
        task.cancel()

    return {"status": "cancelled", "job_id": job_id}


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
        run_real_indexing(job_id),
        get_background_loop(),
    )
    job_tasks[job_id] = task
    task.add_done_callback(
        lambda finished_task: reconcile_job_task(job_id, finished_task)
    )
    return {"job_id": job_id}
