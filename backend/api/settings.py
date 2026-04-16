import os
from fastapi import APIRouter
from pydantic import BaseModel, Field
from dotenv import load_dotenv, set_key
from sentrysearch.store import detect_index


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
    local_model_size: str = Field(
        default_factory=lambda: os.getenv("EMBEDDING_MODEL", "qwen2b")
    )
    active_backend: str | None = None
    active_model: str | None = None
    is_using_fallback: bool = False
    fallback_reason: str | None = None


class LocalModelTestResponse(BaseModel):
    status: str  # "available", "unavailable", "error"
    reason: str | None = None
    model_used: str | None = None


@router.get("/settings")
def get_settings() -> Settings:
    backend, model = detect_index()

    # Get fallback status from embedder module
    try:
        from sentrysearch.embedder import get_fallback_status

        fallback_status = get_fallback_status()
        is_fallback = fallback_status.get("is_using_fallback", False)
        fallback_reason = fallback_status.get("fallback_reason")
        active_backend = fallback_status.get("active_backend", backend)
    except Exception:
        is_fallback = False
        fallback_reason = None
        active_backend = backend

    return Settings(
        active_backend=active_backend,
        active_model=model,
        is_using_fallback=is_fallback,
        fallback_reason=fallback_reason,
    )


@router.put("/settings")
def update_settings(settings: Settings) -> Settings:
    set_key(ENV_PATH, "EMBEDDING_BACKEND", settings.model)
    set_key(ENV_PATH, "CHUNK_DURATION", str(settings.chunk_duration))
    set_key(ENV_PATH, "OVERLAP", str(settings.overlap))
    if settings.gemini_api_key:
        set_key(ENV_PATH, "GEMINI_API_KEY", settings.gemini_api_key)
    if settings.local_model_size:
        set_key(ENV_PATH, "EMBEDDING_MODEL", settings.local_model_size)

    # Reload env
    load_dotenv(ENV_PATH, override=True)
    return settings


@router.post("/settings/test-local", response_model=LocalModelTestResponse)
async def test_local_model() -> LocalModelTestResponse:
    """Test if the local model can be loaded successfully.

    Attempts to load the local Qwen3-VL model and returns status.
    If model loading fails, returns error status with reason.
    """
    import os
    import sys

    # Get the configured model size
    model_size = os.getenv("EMBEDDING_MODEL", "qwen2b")

    try:
        # Try to import and create local embedder
        from sentrysearch.local_embedder import LocalEmbedder

        print(f"Testing local model ({model_size})...", file=sys.stderr)

        # Attempt to create the embedder (this validates model can be loaded)
        embedder = LocalEmbedder(model_name=model_size)

        # Try to actually load the model (this is the expensive part)
        embedder._load_model()

        # If we get here, model loaded successfully
        print(f"Local model ({model_size}) loaded successfully", file=sys.stderr)

        return LocalModelTestResponse(
            status="available", reason=None, model_used=embedder._model_name
        )

    except Exception as e:
        error_msg = str(e)
        print(f"Local model test failed: {error_msg}", file=sys.stderr)

        return LocalModelTestResponse(
            status="unavailable", reason=error_msg, model_used=None
        )
