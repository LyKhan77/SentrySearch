import os
import urllib.parse
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List

from sentrysearch.store import SentryStore, detect_index
from sentrysearch.chunker import _get_video_duration

router = APIRouter()


class LibraryItem(BaseModel):
    id: str
    name: str
    duration: str
    size: str
    status: str
    path: str
    videoUrl: str


def get_base_url(request: Request) -> str:
    """Get the base URL for the API from the request."""
    host = request.headers.get("host", "localhost:8002")
    scheme = request.headers.get("x-forwarded-proto", "http")
    return f"{scheme}://{host}"


@router.get("/library", response_model=List[LibraryItem])
async def get_library(request: Request):
    backend, model = detect_index()
    if backend is None:
        backend = os.getenv("EMBEDDING_BACKEND", "gemini")

    store = SentryStore(backend=backend, model=model)
    s = store.get_stats()

    # Get base URL for constructing full video URLs
    base_url = get_base_url(request)

    # Base storage path for relativizing source_file
    base_assets_path = os.path.abspath("backend/assets")

    items = []
    for i, file_path in enumerate(s["source_files"], 1):
        name = os.path.basename(file_path)
        size_bytes = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        size_str = f"{size_bytes / (1024 * 1024):.1f} MB"

        # Relativize path for streaming
        abs_path = os.path.abspath(file_path)
        if abs_path.startswith(base_assets_path):
            video_id = os.path.relpath(abs_path, base_assets_path)
        else:
            video_id = name

        encoded_video_id = urllib.parse.quote(video_id, safe="")
        # Use FULL URL with host and port for cross-device compatibility
        video_url = f"{base_url}/api/video/stream/{encoded_video_id}"

        # Extract video duration
        try:
            duration_seconds = _get_video_duration(file_path)
            minutes, seconds = divmod(int(duration_seconds), 60)
            hours, minutes = divmod(minutes, 60)
            if hours > 0:
                duration_str = f"{hours}h {minutes}m"
            elif minutes > 0:
                duration_str = f"{minutes}m {seconds}s"
            else:
                duration_str = f"{seconds}s"
        except Exception:
            duration_str = "N/A"

        items.append(
            {
                "id": str(i),
                "name": name,
                "duration": duration_str,
                "size": size_str,
                "status": "indexed" if os.path.exists(file_path) else "missing",
                "path": file_path,
                "videoUrl": video_url,
            }
        )

    return items


@router.delete("/library/{item_id}")
async def delete_library_item(item_id: str, path: str):
    """Remove a file from the index. Optionally could delete file from disk too."""
    backend, model = detect_index()
    if backend is None:
        return {"status": "error", "message": "No index found"}

    store = SentryStore(backend=backend, model=model)
    removed_count = store.remove_file(path)

    return {"status": "success", "removed_chunks": removed_count}
