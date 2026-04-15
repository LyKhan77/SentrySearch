from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class Settings(BaseModel):
    model: str = "qwen3-vl"
    chunk_duration: int = 15
    overlap: int = 3


current_settings = Settings()


@router.get("/settings")
def get_settings() -> Settings:
    return current_settings


@router.put("/settings")
def update_settings(settings: Settings) -> Settings:
    global current_settings
    current_settings = settings
    return current_settings
