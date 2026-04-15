from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SearchResult(BaseModel):
    id: str
    title: str
    thumbnailUrl: str
    score: float
    duration: str
    timestamp: str

@router.get("/search", response_model=List[SearchResult])
async def search(q: str = ""):
    # Return mock results for now
    return [
        {
            "id": "1",
            "title": "Red truck cutting off in intersection",
            "thumbnailUrl": "https://images.unsplash.com/photo-1555519827-0db769b76e82?q=80&w=600&auto=format&fit=crop",
            "score": 0.89,
            "duration": "0:15",
            "timestamp": "2023-10-15 14:32:10"
        },
        {
            "id": "2",
            "title": "Red truck speeding past on highway",
            "thumbnailUrl": "https://images.unsplash.com/photo-1553535948-26154fbd9b3b?q=80&w=600&auto=format&fit=crop",
            "score": 0.76,
            "duration": "0:12",
            "timestamp": "2023-10-12 09:15:22"
        },
        {
            "id": "3",
            "title": "Close call with red SUV",
            "thumbnailUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=600&auto=format&fit=crop",
            "score": 0.65,
            "duration": "0:20",
            "timestamp": "2023-09-28 17:45:00"
        },
    ]
