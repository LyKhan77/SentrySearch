import os
from fastapi import APIRouter
from pydantic import BaseModel
from sentrysearch.store import SentryStore, detect_index, DEFAULT_DB_PATH

router = APIRouter()


class Stats(BaseModel):
    total_videos: int
    total_chunks: int
    vector_db_size: str
    total_footage_duration: str


@router.get("/stats", response_model=Stats)
async def get_stats():
    backend, model = detect_index()
    if backend is None:
        backend = os.getenv("EMBEDDING_BACKEND", "gemini")

    store = SentryStore(backend=backend, model=model)
    s = store.get_stats()

    # Calculate ChromaDB folder size
    db_path = str(DEFAULT_DB_PATH)
    try:
        total_bytes = 0
        if os.path.exists(db_path):
            for dirpath, dirnames, filenames in os.walk(db_path):
                for f in filenames:
                    fp = os.path.join(dirpath, f)
                    try:
                        total_bytes += os.path.getsize(fp)
                    except:
                        pass
        if total_bytes > 0:
            if total_bytes > 1024 * 1024 * 1024:
                vector_db_size = f"{total_bytes / (1024 * 1024 * 1024):.1f} GB"
            elif total_bytes > 1024 * 1024:
                vector_db_size = f"{total_bytes / (1024 * 1024):.1f} MB"
            else:
                vector_db_size = f"{total_bytes / 1024:.1f} KB"
        else:
            vector_db_size = "0 KB"
    except Exception:
        vector_db_size = "N/A"

    # Simple duration estimation (assuming chunk_duration)
    chunk_dur = int(os.getenv("CHUNK_DURATION", "30"))
    total_seconds = s["total_chunks"] * chunk_dur
    h, m = divmod(total_seconds // 60, 60)
    duration_str = f"{h}h {m}m"

    return {
        "total_videos": s["unique_source_files"],
        "total_chunks": s["total_chunks"],
        "vector_db_size": vector_db_size,
        "total_footage_duration": duration_str,
    }
