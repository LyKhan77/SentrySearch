# SentrySearch Architecture & Workflow

This document describes the current repository architecture (FastAPI backend + Next.js frontend + `sentrysearch` core module) using text-based workflow diagrams.

## 1) System Graph (High-Level)

```text
[ User Browser ]
       |
       | HTTP
       v
[ Frontend Next.js :3000 ]
       |
       | REST + SSE
       v
[ Backend FastAPI :8000 ]
       |
       +---> [ Indexing Engine ]
       |        |--> FFmpeg
       |        |--> Embedding Backend (Gemini or Local)
       |        +--> Vector Store (ChromaDB: ~/.sentrysearch/db)
       |
       +---> [ Search Engine ]
       |
       +---> [ Video Service ]
       |        +--> Video Files (backend/assets or absolute path)
       |
       +---> [ Settings Service ]
       |
       +---> [ History Service ]
                +--> Database (SQLite: ~/.sentrysearch/history.db)
```

## 2) Core Components

| Layer | Component | Responsibility |
|---|---|---|
| Frontend | `frontend/` (Next.js 16) | UI for search, indexing, settings, history, and library |
| API | `backend/main.py` + `backend/api/*` | REST/SSE endpoints and orchestration |
| Core processing | `sentrysearch/` | Chunking, embedding, retrieval, trim/overlay |
| Vector store | ChromaDB (`sentrysearch/store.py`) | Embeddings + chunk metadata |
| History store | SQLite (`backend/api/db.py`) | Query history + top result metadata |
| Media processing | FFmpeg (`chunker.py`, `trimmer.py`) | Chunking, preprocessing, trimming |

## 3) Indexing Workflow Graph

```text
[ POST /api/index/start ]
           |
           v
[ Create job_id + queue job ]
           |
           v
[ Background loop: run_real_indexing ]
           |
           v
[ Scan folder or single file ]
           |
           v
    ( Already indexed? )
      /             \
 [ Yes ]           [ No ]
   |                 |
   v                 v
[Skip file]   [ chunk_video with chunk_duration & overlap ]
                     |
                     v
             ( Still frame chunk? )
               /                 \
          [ Yes ]               [ No ]
             |                    |
             v                    v
       [Skip chunk]         ( Backend is Gemini? )
                              /               \
                         [ Yes ]             [ No ]
                            |                  |
                            v                  v
                 [ preprocess_chunk ] [ Use original chunk ]
                            \                  /
                             v                v
                         [ embed_video_chunk ]
                                    |
                                    v
                       [ Collect embedded chunks ]
                                    |
                                    v
                     [ store.add_chunks in ChromaDB ]
                                    |
                                    v
                          [ Cleanup temp files ]
                                    |
                                    v
                  [ Update jobs progress and status ]
                                    |
                                    v
                 [ SSE /api/index/progress/{job_id} ]
                                    |
                                    v
                  [ Frontend updates indexing UI ]
```

### Indexing Notes
- Indexing runs on a dedicated daemon thread event loop (`indexing-loop`).
- Progress is streamed via SSE approximately every 100ms.
- `POST /api/index/cancel/{job_id}` marks the job cancelled and calls `Future.cancel()`.
- Runtime settings come from `.env`: `EMBEDDING_BACKEND`, `EMBEDDING_MODEL`, `CHUNK_DURATION`, `OVERLAP`.

## 4) Search Workflow Graph

```text
[ GET /api/search?q=...&threshold=... ]
                   |
                   v
[ detect_index to choose backend & model ]
                   |
                   v
[ search_footage(query, store, n_results, threshold) ]
                   |
                   v
          [ embed_query(query) ]
                   |
                   v
[ Vector similarity search in ChromaDB ]
                   |
                   v
[ Top hits with source_file/start/end/score ]
                   |
                   v
  [ Format API response for frontend ]
                   |
                   v
[ log_search into SQLite history.db ]
                   |
                   v
    [ Return SearchResult list ]
                   |
                   v
    [ Frontend shows results ]
                   |
        +----------+----------+
        |                     |
        v                     v
[ DualVideoPlayer ]   [ DualVideoPlayer ]
[ requests        ]   [ requests        ]
[ /api/video/     ]   [ /api/video/     ]
[ stream/{id}     ]   [ trim/{id}       ]
```

## 5) Data & Storage Graph

```text
[ Video Source Paths ]
          |
          v
 [ Chunk Metadata ]
          |
          v
( Chroma Collection per backend/model ) <--- [ Query Embedding ] <--- [ Search Query ]
          |
          v
  [ Search Results ]
          |
          v
( SQLite History: query, count, best_score, top_result )
```

- Vector DB path: `~/.sentrysearch/db`
- History DB path: `~/.sentrysearch/history.db`
- Original videos are not copied into DB; only file references + metadata are stored.

## 6) API Surface

### Health & Settings
- `GET /api/health`
- `GET /api/settings`
- `PUT /api/settings`

### Indexing
- `POST /api/index/start`
- `GET /api/index/progress/{job_id}` (SSE)
- `POST /api/index/cancel/{job_id}`

### Retrieval & Media
- `GET /api/search`
- `GET /api/stats`
- `GET /api/library`
- `DELETE /api/library/{item_id}?path=...`
- `GET /api/history`
- `GET /api/video/stream/{video_id}`
- `GET /api/video/trim/{video_id}?start=...&end=...&padding=...`

## 7) Runtime Notes

- Backend CORS allows `http://localhost:3000`.
- Frontend default API base is `http://localhost:8000/api` (`NEXT_PUBLIC_API_URL` can override).
- Gemini embedder uses `gemini-embedding-2-preview`.
- Local embedding requires extra dependencies (`torch`, `transformers`, etc.).
