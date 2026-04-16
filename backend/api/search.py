import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from sentrysearch.search import search_footage
from sentrysearch.store import SentryStore, detect_index
from sentrysearch.embedder import get_embedder, reset_embedder, get_fallback_status
from sentrysearch.fallback_embedder import set_fallback_callback
from backend.api.db import log_search

router = APIRouter()


class SearchResult(BaseModel):
    id: str
    title: str
    thumbnailUrl: str
    score: float
    duration: str
    timestamp: str
    videoUrl: str
    startTime: float
    endTime: float
    originalPath: str
    usedFallback: bool = False
    fallbackReason: str | None = None


@router.get("/search", response_model=List[SearchResult])
async def search(q: str = "", threshold: float = 0.0):
    backend, model = detect_index()
    if backend is None:
        backend = os.getenv("EMBEDDING_BACKEND", "gemini")

    # Reset embedder to ensure clean state
    reset_embedder()

    # Track fallback status
    fallback_occurred = False
    fallback_reason = None

    def on_fallback(reason: str):
        nonlocal fallback_occurred, fallback_reason
        fallback_occurred = True
        fallback_reason = reason

    # Set up fallback callback
    set_fallback_callback(on_fallback)

    # Get embedder with fallback enabled for local backend
    embedder = get_embedder(backend, use_fallback=True, model=model)
    store = SentryStore(backend=backend, model=model)

    results = search_footage(q, store, n_results=10, threshold=threshold)

    # Check fallback status after search
    fallback_status = get_fallback_status()
    if fallback_status.get("is_using_fallback"):
        fallback_occurred = True
        fallback_reason = fallback_status.get("fallback_reason")

    # Base storage path for relativizing source_file
    base_assets_path = os.path.abspath("backend/assets")

    items = []
    for i, r in enumerate(results, 1):
        source_file = r.get("source_file", "unknown")
        # Relativize source_file to get video_id for streaming
        abs_source = os.path.abspath(source_file)
        if abs_source.startswith(base_assets_path):
            video_id = os.path.relpath(abs_source, base_assets_path)
        else:
            # Fallback if not in assets (though it should be)
            video_id = os.path.basename(source_file)

        # URL encode video_id for the streaming endpoint
        import urllib.parse

        encoded_video_id = urllib.parse.quote(video_id, safe="")
        # Use relative URL for cross-device compatibility
        video_url = f"/api/video/stream/{encoded_video_id}"

        start_time = r.get("start_time", 0.0)
        end_time = r.get("end_time", 0.0)
        duration_sec = int(end_time - start_time)

        items.append(
            {
                "id": str(i),
                "title": os.path.basename(source_file),
                "thumbnailUrl": "/placeholder-clip.jpg",  # Keep placeholder for now
                "score": r.get("similarity_score", r.get("score", 0.0)),
                "duration": f"{duration_sec}s",
                "timestamp": r.get("indexed_at", "N/A"),
                "videoUrl": video_url,
                "startTime": start_time,
                "endTime": end_time,
                "originalPath": source_file,
                "usedFallback": fallback_occurred,
                "fallbackReason": fallback_reason,
            }
        )

    # Log the search if there were results
    if results:
        best = results[0]
        log_search(
            query=q,
            count=len(results),
            score=float(best.get("similarity_score", 0.0)),
            metadata={
                "top_result_title": os.path.basename(
                    best.get("source_file", "unknown")
                ),
                "top_result_duration": f"{int(best.get('end_time', 0) - best.get('start_time', 0))}s",
                "used_fallback": fallback_occurred,
            },
        )

    # Clean up embedder
    reset_embedder()

    return items
