"""Fallback embedder that tries local model first, falls back to Gemini.

This module provides a wrapper embedder that attempts to use the local Qwen3-VL
model first, and automatically falls back to Gemini embedding if any error occurs.
"""

import sys
from typing import Callable

from .base_embedder import BaseEmbedder


# Global callback for fallback notifications
_fallback_callback: Callable[[str], None] | None = None


def set_fallback_callback(callback: Callable[[str], None] | None):
    """Set a callback to be called when fallback occurs.

    The callback receives a string describing why the fallback happened.
    """
    global _fallback_callback
    _fallback_callback = callback


def _notify_fallback(reason: str):
    """Notify that fallback to Gemini has occurred."""
    if _fallback_callback:
        _fallback_callback(reason)
    print(f"[FallbackEmbedder] Switched to Gemini: {reason}", file=sys.stderr)


class FallbackEmbedder(BaseEmbedder):
    """Embedder that tries local model first, falls back to Gemini on error.

    This wrapper provides transparent fallback behavior:
    1. Attempts to load and use the local Qwen3-VL model
    2. If loading fails or any runtime error occurs, switches to Gemini
    3. Once fallback occurs, stays on Gemini for the session
    4. Notifies via callback when fallback happens

    Attributes:
        is_using_fallback: True if currently using Gemini instead of local model
        fallback_reason: Description of why fallback occurred (if any)
        active_backend: Name of currently active backend ("local" or "gemini")
    """

    def __init__(
        self,
        model_name: str = "qwen2b",
        dimensions: int = 768,
        quantize: bool | None = None,
    ):
        """Initialize the fallback embedder.

        Args:
            model_name: Local model to use ("qwen2b" or "qwen8b")
            dimensions: Embedding dimensions (default 768)
            quantize: Whether to use 4-bit quantization (None = auto-detect)
        """
        self._model_name = model_name
        self._dimensions = dimensions
        self._quantize = quantize
        self._local_embedder = None
        self._gemini_embedder = None
        self._using_fallback = False
        self._fallback_reason: str | None = None

    def _try_get_local(self):
        """Try to get local embedder, return None on failure."""
        if self._local_embedder is not None:
            return self._local_embedder

        try:
            from .local_embedder import LocalEmbedder

            self._local_embedder = LocalEmbedder(
                model_name=self._model_name,
                dimensions=self._dimensions,
                quantize=self._quantize,
            )
            return self._local_embedder
        except Exception as e:
            reason = f"Failed to load local model: {e}"
            _notify_fallback(reason)
            self._using_fallback = True
            self._fallback_reason = reason
            return None

    def _get_gemini(self):
        """Get or create Gemini embedder."""
        if self._gemini_embedder is None:
            from .gemini_embedder import GeminiEmbedder

            self._gemini_embedder = GeminiEmbedder()
        return self._gemini_embedder

    def embed_video_chunk(self, chunk_path: str, verbose: bool = False) -> list[float]:
        """Embed video chunk, with fallback to Gemini on error.

        Args:
            chunk_path: Path to video chunk file
            verbose: If True, print debug info

        Returns:
            Embedding vector as list of floats

        Raises:
            Any exception from GeminiEmbedder if both local and Gemini fail
        """
        # Try local first if not already using fallback
        if not self._using_fallback:
            local = self._try_get_local()
            if local is not None:
                try:
                    return local.embed_video_chunk(chunk_path, verbose=verbose)
                except Exception as e:
                    reason = f"Local model failed during video embedding: {e}"
                    _notify_fallback(reason)
                    self._using_fallback = True
                    self._fallback_reason = reason

        # Fallback to Gemini
        return self._get_gemini().embed_video_chunk(chunk_path, verbose=verbose)

    def embed_query(self, query_text: str, verbose: bool = False) -> list[float]:
        """Embed query text, with fallback to Gemini on error.

        Args:
            query_text: Text query to embed
            verbose: If True, print debug info

        Returns:
            Embedding vector as list of floats

        Raises:
            Any exception from GeminiEmbedder if both local and Gemini fail
        """
        # Try local first if not already using fallback
        if not self._using_fallback:
            local = self._try_get_local()
            if local is not None:
                try:
                    return local.embed_query(query_text, verbose=verbose)
                except Exception as e:
                    reason = f"Local model failed during query embedding: {e}"
                    _notify_fallback(reason)
                    self._using_fallback = True
                    self._fallback_reason = reason

        # Fallback to Gemini
        return self._get_gemini().embed_query(query_text, verbose=verbose)

    def dimensions(self) -> int:
        """Return embedding dimensions."""
        return self._dimensions

    @property
    def is_using_fallback(self) -> bool:
        """Return True if currently using Gemini fallback."""
        return self._using_fallback

    @property
    def fallback_reason(self) -> str | None:
        """Return the reason for fallback, if any."""
        return self._fallback_reason

    @property
    def active_backend(self) -> str:
        """Return currently active backend name."""
        return "gemini" if self._using_fallback else "local"
