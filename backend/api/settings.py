import os
import sys
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
    # Get configured backend from ENV (what user selected in UI)
    configured_backend = os.getenv("EMBEDDING_BACKEND", "gemini")
    configured_model = os.getenv("EMBEDDING_MODEL", "qwen2b")

    # Get active backend from embedder (what's actually loaded/used)
    try:
        from sentrysearch.embedder import get_current_backend, get_fallback_status

        active_backend = get_current_backend()
        fallback_status = get_fallback_status()
        is_fallback = fallback_status.get("is_using_fallback", False)
        fallback_reason = fallback_status.get("fallback_reason")
    except Exception:
        # If embedder not loaded yet, use configured values
        active_backend = configured_backend
        is_fallback = False
        fallback_reason = None

    # Get active model (from fallback status or configured)
    active_model = configured_model
    if is_fallback and fallback_reason:
        # If fallback occurred, we're using Gemini (which has no model variant)
        pass  # active_model stays as configured

    return Settings(
        active_backend=active_backend,
        active_model=active_model,
        is_using_fallback=is_fallback,
        fallback_reason=fallback_reason,
    )


@router.put("/settings")
def update_settings(settings: Settings) -> Settings:
    # Get current backend before update
    current_backend = os.getenv("EMBEDDING_BACKEND", "gemini")
    new_backend = settings.model

    set_key(ENV_PATH, "EMBEDDING_BACKEND", settings.model)
    set_key(ENV_PATH, "CHUNK_DURATION", str(settings.chunk_duration))
    set_key(ENV_PATH, "OVERLAP", str(settings.overlap))
    if settings.gemini_api_key:
        set_key(ENV_PATH, "GEMINI_API_KEY", settings.gemini_api_key)
    if settings.local_model_size:
        set_key(ENV_PATH, "EMBEDDING_MODEL", settings.local_model_size)

    # Reload env
    load_dotenv(ENV_PATH, override=True)

    # Reset embedder if backend changed
    if current_backend != new_backend:
        try:
            from sentrysearch.embedder import reset_embedder

            reset_embedder()
            print(
                f"Embedder reset: backend changed from {current_backend} to {new_backend}",
                file=sys.stderr,
            )
        except Exception as e:
            print(f"Warning: Failed to reset embedder: {e}", file=sys.stderr)

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
