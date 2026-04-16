from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from backend.api.db import get_db, SearchHistory

router = APIRouter()

class HistoryItem(BaseModel):
    id: int
    query: str
    timestamp: str
    results_count: int
    best_score: float
    top_result: str

@router.get("/history", response_model=List[HistoryItem])
async def get_history(db: Session = Depends(get_db)):
    entries = db.query(SearchHistory).order_by(SearchHistory.timestamp.desc()).limit(20).all()
    
    items = []
    for e in entries:
        meta = e.results_metadata or {}
        items.append(HistoryItem(
            id=e.id,
            query=e.query,
            timestamp=e.timestamp.isoformat(),
            results_count=e.results_count,
            best_score=e.best_score,
            top_result=meta.get("top_result_title", "N/A")
        ))
    
    return items
