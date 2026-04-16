"""Embedder factory — selects and caches the active backend.

Provides backward-compatible top-level functions (embed_video_chunk,
embed_query) that delegate to whichever backend is currently active.
Re-exports error classes from gemini_embedder for existing import sites.
"""

from .base_embedder import BaseEmbedder
from .gemini_embedder import GeminiAPIKeyError, GeminiQuotaError  # noqa: F401

_current_embedder: BaseEmbedder | None = None
_current_backend: str = "gemini"
_current_model: str | None = None


def get_embedder(
    backend: str = "gemini", use_fallback: bool = True, **kwargs
) -> BaseEmbedder:
    """Factory to get or create the active embedder.

    Args:
        backend: Which backend to use ("gemini" or "local")
        use_fallback: If True and backend is "local", use FallbackEmbedder
                     which automatically falls back to Gemini on errors
        **kwargs: Additional arguments passed to embedder constructor
                 (model, dimensions, quantize for local backend)

    Returns:
        BaseEmbedder instance
    """
    global _current_embedder, _current_backend, _current_model
    if _current_embedder is None:
        _current_backend = backend
        _current_model = kwargs.get("model")

        if backend == "gemini":
            from .gemini_embedder import GeminiEmbedder

            _current_embedder = GeminiEmbedder()
        elif backend == "local":
            if use_fallback:
                # Use fallback wrapper that can switch to Gemini on errors
                from .fallback_embedder import FallbackEmbedder

                model = kwargs.get("model", "qwen2b")  # Default to 2B for 16GB Macs
                dims = kwargs.get("dimensions", 768)
                quantize = kwargs.get("quantize", None)
                _current_embedder = FallbackEmbedder(
                    model_name=model, dimensions=dims, quantize=quantize
                )
            else:
                # Use local embedder directly (no fallback)
                from .local_embedder import LocalEmbedder

                model = kwargs.get("model", "qwen2b")
                dims = kwargs.get("dimensions", 768)
                quantize = kwargs.get("quantize", None)
                _current_embedder = LocalEmbedder(
                    model_name=model, dimensions=dims, quantize=quantize
                )
        else:
            raise ValueError(f"Unknown backend: {backend}")
    return _current_embedder


def reset_embedder():
    """Reset the cached embedder (for switching backends)."""
    global _current_embedder, _current_backend, _current_model
    _current_embedder = None
    _current_backend = "gemini"
    _current_model = None


def get_current_backend() -> str:
    """Return the currently active backend name.

    If using FallbackEmbedder, returns the actual backend being used
    ("local" or "gemini") based on whether fallback occurred.
    """
    global _current_embedder, _current_backend

    if _current_embedder is None:
        return _current_backend

    # Check if it's a FallbackEmbedder and get actual backend
    from .fallback_embedder import FallbackEmbedder

    if isinstance(_current_embedder, FallbackEmbedder):
        return _current_embedder.active_backend

    return _current_backend


def get_fallback_status() -> dict:
    """Get the current fallback status.

    Returns:
        Dict with keys:
        - is_using_fallback: bool - True if using Gemini instead of local
        - fallback_reason: str | None - Why fallback occurred
        - configured_backend: str - Backend that was originally requested
        - active_backend: str - Backend actually being used
    """
    global _current_embedder, _current_backend

    result = {
        "is_using_fallback": False,
        "fallback_reason": None,
        "configured_backend": _current_backend,
        "active_backend": _current_backend,
    }

    from .fallback_embedder import FallbackEmbedder

    if isinstance(_current_embedder, FallbackEmbedder):
        result["is_using_fallback"] = _current_embedder.is_using_fallback
        result["fallback_reason"] = _current_embedder.fallback_reason
        result["active_backend"] = _current_embedder.active_backend

    return result


# Convenience functions — backward compatible with existing callers
def embed_video_chunk(chunk_path: str, verbose: bool = False) -> list[float]:
    """Embed a video chunk using the current embedder."""
    return get_embedder().embed_video_chunk(chunk_path, verbose=verbose)


def embed_query(query_text: str, verbose: bool = False) -> list[float]:
    """Embed a query text using the current embedder."""
    return get_embedder().embed_query(query_text, verbose=verbose)
