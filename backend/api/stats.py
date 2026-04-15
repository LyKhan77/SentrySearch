from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Stats(BaseModel):
    total_videos: int
    total_chunks: int
    vector_db_size: str
    total_footage_duration: str

@router.get("/stats", response_model=Stats)
async def get_stats():
    # Return mock data for now
    return {
        "total_videos": 1248,
        "total_chunks": 15420,
        "vector_db_size": "2.4 GB",
        "total_footage_duration": "45h 12m",
    }
