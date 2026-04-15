# Backend Integration Design (FastAPI)

**Date**: April 15, 2026
**Topic**: SentrySearch UI - Backend Integration

## 1. Architecture Overview
- **Framework**: FastAPI (Python)
- **Host/Port**: `http://localhost:8000` (default)
- **Role**: Serve as a RESTful middleware connecting the Next.js UI frontend to the core SentrySearch Python logic. 

## 2. Core Integration Strategy
The backend will **NOT** use `subprocess.run()` to execute SentrySearch CLI commands. Instead, it will directly import and invoke the core Python functions from the SentrySearch module (`indexer.py`, `searcher.py`, `embedder.py`, etc.). This eliminates CLI startup overhead and allows for finer-grained control and error handling.

## 3. Communication Protocol (Real-time)
For long-running tasks like **Indexing**, we will use **Server-Sent Events (SSE)**.
- **Why SSE?**: The indexing process only requires one-way communication (server streaming progress updates, logs, and estimated time remaining to the client). SSE is lighter and easier to implement over standard HTTP than WebSockets.

## 4. API Contract (Endpoints)

### A. Dashboard & Settings
- `GET /api/stats`
  - Returns: `{ indexed_videos: int, total_chunks: int, db_size_mb: float, total_footage_hours: float }`
- `GET /api/settings`
  - Returns: Current configuration (model choice, API keys, thresholds, chunk duration, overlap).
- `PUT /api/settings`
  - Payload: `{ "model": "qwen3-vl", "chunk_duration": 15, ... }`
  - Updates `.env` or application config state.

### B. Indexing (SSE)
- `POST /api/index/start`
  - Payload: `{ "folder_path": "/path/to/videos" }`
  - Action: Spawns a background task (e.g., using `asyncio.create_task` or FastAPI's `BackgroundTasks`) to run the indexing logic.
  - Returns: `{ "job_id": "abc-123" }`
- `GET /api/index/progress/{job_id}`
  - Returns: An EventStream (SSE) yielding data like `data: {"progress": 45, "status": "Processing 2023-10-15_14-30.mp4 (Chunk 12/45)", "eta": "4m left"}\n\n`
- `POST /api/index/cancel/{job_id}`
  - Action: Safely aborts the indexing background task.

### C. Search & Retrieval
- `POST /api/search`
  - Payload: `{ "query": "red truck cutting off", "threshold": 0.65, "limit": 20 }`
  - Returns: `[ { "id": "...", "title": "...", "thumbnailUrl": "...", "score": 0.89, "duration": "0:15", "timestamp": "..." } ]`
- `GET /api/clips/{clip_id}`
  - Action: Serves the trimmed `.mp4` video file or redirects to a static file route if the clip exists on disk.
- `GET /api/videos/original/{video_id}`
  - Action: Serves the original raw `.mp4` dashcam video.

### D. Library & History
- `GET /api/library`
  - Returns: A list of all indexed original video files and their indexing status (indexed, error).
- `DELETE /api/library/{video_id}`
  - Action: Removes the video from ChromaDB and deletes generated thumbnails/clips (but not the original footage).
- `GET /api/history`
  - Returns: List of past search queries (persisted in a lightweight local DB like SQLite or TinyDB).

## 5. Error Handling
All API responses that fail will return standard HTTP status codes (400, 404, 500) and a consistent JSON payload:
```json
{
  "error": "Invalid API Key",
  "details": "The Google Gemini API key provided is not authorized.",
  "code": 401
}
```

## 6. Testing Strategy
- Use `pytest` and `httpx` (FastAPI `TestClient`) to test endpoints.
- Mock the core SentrySearch logic during API tests to avoid long-running indexing or expensive embedding generation.
