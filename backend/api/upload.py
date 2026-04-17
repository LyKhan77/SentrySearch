import os
import uuid
import shutil
import asyncio

from fastapi import APIRouter, UploadFile, File, HTTPException

from sentrysearch.chunker import SUPPORTED_VIDEO_EXTENSIONS, is_supported_video_file
from backend.api.indexing import (
    jobs,
    job_tasks,
    reconcile_job_task,
    run_real_indexing,
    get_background_loop,
)

router = APIRouter()

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
STAGING_DIR = os.path.join(PROJECT_ROOT, "backend", "assets", "uploads")


def _ensure_staging_dir() -> str:
    os.makedirs(STAGING_DIR, exist_ok=True)
    return STAGING_DIR


@router.post("/index/upload")
async def upload_videos(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    _ensure_staging_dir()
    session_id = str(uuid.uuid4())
    staging_path = os.path.join(STAGING_DIR, session_id)
    os.makedirs(staging_path, exist_ok=True)

    saved_files = []
    rejected = []

    for upload in files:
        filename = upload.filename or ""
        if not is_supported_video_file(filename):
            rejected.append(
                {
                    "filename": filename,
                    "reason": f"Unsupported extension. Supported: {', '.join(SUPPORTED_VIDEO_EXTENSIONS)}",
                }
            )
            continue

        dest = os.path.join(staging_path, filename)
        try:
            with open(dest, "wb") as f:
                content = await upload.read()
                if len(content) == 0:
                    rejected.append({"filename": filename, "reason": "Empty file"})
                    continue
                f.write(content)
            saved_files.append(filename)
        except Exception as e:
            rejected.append({"filename": filename, "reason": str(e)})

    if not saved_files:
        shutil.rmtree(staging_path, ignore_errors=True)
        raise HTTPException(
            status_code=400,
            detail={"message": "No valid video files uploaded", "rejected": rejected},
        )

    return {
        "session_id": session_id,
        "staging_path": staging_path,
        "saved_files": saved_files,
        "rejected": rejected,
        "file_count": len(saved_files),
    }


@router.post("/index/upload-and-index")
async def upload_and_index(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    _ensure_staging_dir()
    session_id = str(uuid.uuid4())
    staging_path = os.path.join(STAGING_DIR, session_id)
    os.makedirs(staging_path, exist_ok=True)

    saved_files = []
    rejected = []

    for upload in files:
        filename = upload.filename or ""
        if not is_supported_video_file(filename):
            rejected.append(
                {
                    "filename": filename,
                    "reason": f"Unsupported extension. Supported: {', '.join(SUPPORTED_VIDEO_EXTENSIONS)}",
                }
            )
            continue

        dest = os.path.join(staging_path, filename)
        try:
            with open(dest, "wb") as f:
                content = await upload.read()
                if len(content) == 0:
                    rejected.append({"filename": filename, "reason": "Empty file"})
                    continue
                f.write(content)
            saved_files.append(filename)
        except Exception as e:
            rejected.append({"filename": filename, "reason": str(e)})

    if not saved_files:
        shutil.rmtree(staging_path, ignore_errors=True)
        raise HTTPException(
            status_code=400,
            detail={"message": "No valid video files uploaded", "rejected": rejected},
        )

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "folder_path": staging_path,
        "progress": 0,
        "status": "queued",
        "eta": "pending",
        "done": False,
        "cancelled": False,
        "fallback_occurred": False,
        "fallback_reason": None,
    }
    task = asyncio.run_coroutine_threadsafe(
        run_real_indexing(job_id),
        get_background_loop(),
    )
    job_tasks[job_id] = task
    task.add_done_callback(
        lambda finished_task: reconcile_job_task(job_id, finished_task)
    )

    return {
        "job_id": job_id,
        "staging_path": staging_path,
        "saved_files": saved_files,
        "rejected": rejected,
        "file_count": len(saved_files),
    }
