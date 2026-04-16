import os
from fastapi import APIRouter
from pydantic import BaseModel, Field
from dotenv import load_dotenv, set_key


router = APIRouter()

# Load existing .env if it exists
ENV_PATH = ".env"
load_dotenv(ENV_PATH)


class Settings(BaseModel):
    model: str = Field(default_factory=lambda: os.getenv("EMBEDDING_BACKEND", "gemini"))
    chunk_duration: int = Field(
        default_factory=lambda: int(os.getenv("CHUNK_DURATION", "5"))
    )
    overlap: int = Field(default_factory=lambda: int(os.getenv("OVERLAP", "2")))
    gemini_api_key: str | None = Field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY")
    )


@router.get("/settings")
def get_settings() -> Settings:
    return Settings()


@router.put("/settings")
def update_settings(settings: Settings) -> Settings:
    set_key(ENV_PATH, "EMBEDDING_BACKEND", settings.model)
    set_key(ENV_PATH, "CHUNK_DURATION", str(settings.chunk_duration))
    set_key(ENV_PATH, "OVERLAP", str(settings.overlap))
    if settings.gemini_api_key:
        set_key(ENV_PATH, "GEMINI_API_KEY", settings.gemini_api_key)

    # Reload env
    load_dotenv(ENV_PATH, override=True)
    return settings
