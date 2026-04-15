# backend/api/library.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class LibraryItem(BaseModel):
    id: int
    name: str
    duration: str
    size: str
    status: str

@router.get("/library", response_model=List[LibraryItem])
async def get_library():
    # Return mock data for now
    return [
        {"id": 1, "name": "2023-10-15_14-30.mp4", "duration": "12:05", "size": "345 MB", "status": "indexed"},
        {"id": 2, "name": "2023-10-15_15-10.mp4", "duration": "05:22", "size": "120 MB", "status": "indexed"},
        {"id": 3, "name": "2023-10-16_08-45.mp4", "duration": "24:10", "size": "670 MB", "status": "indexing"},
        {"id": 4, "name": "2023-10-16_18-05.mp4", "duration": "15:30", "size": "410 MB", "status": "error"},
    ]
