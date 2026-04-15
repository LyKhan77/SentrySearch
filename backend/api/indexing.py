import uuid

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class IndexRequest(BaseModel):
    folder_path: str


@router.post("/index/start")
def start_indexing(_: IndexRequest) -> dict[str, str]:
    return {"job_id": str(uuid.uuid4())}
