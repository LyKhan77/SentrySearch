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

    # Try multiple locations to find the video
    possible_paths = [
        # 1. If it's already an absolute path that exists
        video_id if os.path.isabs(video_id) and os.path.exists(video_id) else None,
        # 2. In the backend/assets directory (as stored path)
        os.path.join(VIDEO_STORAGE_PATH, video_id),
        # 3. In the project root (common for indexed videos)
        os.path.join(PROJECT_ROOT, video_id),
        # 4. Just the basename in assets
        os.path.join(VIDEO_STORAGE_PATH, os.path.basename(video_id)),
        # 5. In a 'vids' subdirectory of assets
        os.path.join(VIDEO_STORAGE_PATH, "vids", os.path.basename(video_id)),
        # 6. In the current working directory
        os.path.join(os.getcwd(), video_id),
        # 7. In the current working directory's vids folder
        os.path.join(os.getcwd(), "vids", os.path.basename(video_id)),
    ]

    for path in possible_paths:
        if path and os.path.exists(path):
            return path

    return None


@router.get("/stream/{video_id:path}")
async def stream_video(video_id: str):
    file_path = _resolve_video_path(video_id)
    if file_path is None:
        return JSONResponse(
            status_code=404,
            content={
                "error": "Video not found",
                "details": f"File '{video_id}' not found. Searched in: assets/, project root/, and current directory",
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
                "details": f"File '{video_id}' not found",
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
