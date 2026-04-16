"""Query and retrieval logic."""

from .embedder import embed_query
from .store import SentryStore


def search_footage(
    query: str,
    store: SentryStore,
    n_results: int = 5,
    threshold: float = 0.0,
    verbose: bool = False,
) -> list[dict]:
    """Search indexed footage with a natural language query.

    Args:
        query: Natural language search string.
        store: SentryStore instance to search against.
        n_results: Maximum number of results to return.
        threshold: Minimum similarity score (0.0 to 1.0).
        verbose: If True, print debug info to stderr.

    Returns:
        List of result dicts sorted by relevance (best first).
        Each dict contains: source_file, start_time, end_time, similarity_score.
    """
    query_embedding = embed_query(query, verbose=verbose)
    hits = store.search(query_embedding, n_results=n_results)

    results = []
    for hit in hits:
        score = hit["score"]
        if score < threshold:
            continue
            
        results.append({
            "source_file": hit["source_file"],
            "start_time": hit["start_time"],
            "end_time": hit["end_time"],
            "similarity_score": score,
        })

    results.sort(key=lambda r: r["similarity_score"], reverse=True)
    return results
