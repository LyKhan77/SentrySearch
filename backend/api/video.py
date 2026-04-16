import os
import shutil
import tempfile
from fastapi import APIRouter, Query
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask

from sentrysearch.trimmer import trim_clip

router = APIRouter()

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VIDEO_STORAGE_PATH = os.path.join(PROJECT_ROOT, "backend", "assets")


def _resolve_video_path(video_id: str) -> str | None:
    import urllib.parse

    video_id = urllib.parse.unquote(video_id)
    if os.path.isabs(video_id) and os.path.exists(video_id):
        return video_id
    file_path = os.path.join(VIDEO_STORAGE_PATH, video_id)
    if os.path.exists(file_path):
        return file_path
    alt_path = os.path.join(VIDEO_STORAGE_PATH, "vids", os.path.basename(video_id))
    if os.path.exists(alt_path):
        return alt_path
    return None


@router.get("/stream/{video_id:path}")
async def stream_video(video_id: str):
    file_path = _resolve_video_path(video_id)
    if file_path is None:
        return JSONResponse(
            status_code=404,
            content={
                "error": "Video not found",
                "details": f"File {video_id} not found",
            },
        )
    return FileResponse(file_path, media_type="video/mp4")


@router.get("/trim/{video_id:path}")
async def trim_video(
    video_id: str,
    start: float = Query(..., ge=0),
    end: float = Query(..., gt=0),
    padding: float = Query(default=2.0, ge=0),
):
    file_path = _resolve_video_path(video_id)
    if file_path is None:
        return JSONResponse(
            status_code=404,
            content={
                "error": "Video not found",
                "details": f"File {video_id} not found",
            },
        )

    if end <= start:
        return JSONResponse(
            status_code=400,
            content={
                "error": "Invalid range",
                "details": f"end ({end}) must be greater than start ({start})",
            },
        )

    tmp_dir = tempfile.mkdtemp(prefix="sentrysearch_trim_")
    output_path = os.path.join(tmp_dir, "trimmed.mp4")

    try:
        trim_clip(file_path, start, end, output_path, padding=padding)
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        return JSONResponse(
            status_code=500,
            content={"error": "Trim failed", "details": str(e)},
        )

    def cleanup():
        shutil.rmtree(tmp_dir, ignore_errors=True)

    return FileResponse(
        output_path,
        media_type="video/mp4",
        background=BackgroundTask(cleanup),
    )
