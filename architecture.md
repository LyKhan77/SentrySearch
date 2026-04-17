# SentrySearch Architecture & Workflow

This document describes the current repository architecture (FastAPI backend + Next.js frontend + `sentrysearch` core module) using text-based workflow diagrams.

## 1) System Graph (High-Level)

```text
[ User Browser ]
       |
       | HTTP
       v
[ Frontend Next.js :3002 ]
       |
       | REST + SSE
       v
[ Backend FastAPI :8002 ]
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

- Backend CORS allows all origins (`*`) for cross-device access.
- Frontend default API base is `http://0.0.0.0:8002/api` (`NEXT_PUBLIC_API_URL` can override for your Mac's IP).
- Gemini embedder uses `gemini-embedding-2-preview`.
- Local embedding requires extra dependencies (`torch`, `transformers`, etc.).

## 8) Analogy: Smart Library for Videos

Think of SentrySearch as a **smart library card catalog** for video footage:

### Chunking = Cutting Trailers
A 10-minute video is sliced into 30-second clips with 5-second overlaps—like creating overlapping movie trailers so no scene is lost at the cut boundaries.

```text
Video: [========================================] 10 min

Chunk 1: [==========]  0:00-0:30
Chunk 2:      [==========]  0:25-0:55   (overlap 5s)
Chunk 3:           [==========]  0:50-1:20
```

### Preprocessing = Making Thumbnails
Each clip is compressed (480p, 5fps) and still-frame segments are discarded—like shrinking photos to thumbnail size and throwing away blank pages.

### Embedding = AI Fingerprints
Each clip is converted into a 768-number "fingerprint" by AI—like a librarian writing a semantic summary in a language only computers understand.

```text
Video clip --[Gemini AI]--> [0.23, -0.45, 0.89, ...] 768-dimension vector
                               (visual fingerprint)
```

### Storage = Filing Cabinet
Fingerprints are stored in ChromaDB with file paths and timestamps—like index cards pointing to exactly where each scene lives.

```text
ChromaDB Collection
┌────────────────────────────────────────────┐
│  File           Time        Fingerprint          │
│  ─────────────  ──────────  ────────────────────────  │
│  dashcam.mp4    0:00-0:30   [0.23, -0.45, ...]   │
│  dashcam.mp4    0:25-0:55   [0.11, 0.88, ...]    │
│  dashcam.mp4    0:50-1:20   [-0.33, 0.67, ...]   │
└────────────────────────────────────────────┘
```

### Search = Semantic Lookup
When you search "red motorcycle," your query becomes a fingerprint and the system finds the closest matches—like asking the librarian for "books about adventure" and getting relevant results even if "adventure" isn't in the title.

```text
"red motorcycle" --[Gemini]--> [-0.12, 0.34, ...] --[ChromaDB]--> Top matches
                                      │
                                      v
                           dashcam.mp4 @ 05:23 (score: 0.89)
                           dashcam.mp4 @ 02:15 (score: 0.76)
```

### Full Pipeline Visualization

```text
Indexing Flow:
┌────┐    ┌─────┐    ┌───────┐    ┌──────┐    ┌──────┐
│ 📹 │ -> │ ✂️ │ -> │ 📡 │ -> │ 🧚 │ -> │ 💾 │
└────┘    └─────┘    └───────┘    └──────┘    └──────┘
 Video   Chunk   Preprocess  Embed    Store

Search Flow:
🔍 Query --[Embed]--> 🔑 Fingerprint --[Search]--> 📋 Results (file + time)
```
