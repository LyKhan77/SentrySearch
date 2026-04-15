from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class HistoryItem(BaseModel):
    id: int
    query: str
    time: str
    results: int

@router.get("/history", response_model=List[HistoryItem])
async def get_history():
    # Return mock data for now
    return [
        {"id": 1, "query": "Red truck cutting me off", "time": "2 hours ago", "results": 3},
        {"id": 2, "query": "Deer crossing road at night", "time": "Yesterday", "results": 1},
        {"id": 3, "query": "Motorcycle weaving through traffic", "time": "Oct 12, 2023", "results": 8},
    ]
