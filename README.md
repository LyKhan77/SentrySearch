# SentrySearch

Semantic dashcam video search using multimodal embeddings. Index your Sentry Mode / dashcam footage, then find events with natural language queries like "car running a red light" or "person walking near the driveway at night".

## How It Works

1. **Index** — Videos are split into overlapping chunks, embedded with Google Gemini or a local Qwen3-VL model, and stored in ChromaDB.
2. **Search** — Your natural language query is embedded the same way, and the closest matching chunks are retrieved by cosine similarity.
3. **Trim** — Matching segments are extracted with configurable padding and available for download or side-by-side playback.

## Quick Start (Current Repo State)

### Prerequisites

- Python 3.12+
- Node.js 20+ (for frontend)
- [FFmpeg](https://ffmpeg.org/) (for video chunking and trimming)
- A [Gemini API key](https://aistudio.google.com/apikey) for Gemini backend

### Install

If you want to fully reset Python environments and keep only one venv in the project root:

```bash
cd /path/to/sentrySearch

# remove common old venv locations (safe to run even if folders do not exist)
rm -rf .venv venv backend/venv backend/.venv

# create a single root venv
python3 -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows

# bootstrap pip inside this venv
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

Then install project dependencies:

```bash
git clone https://github.com/ssrajadh/sentrysearch.git
cd sentrysearch
python3 -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows
python -m ensurepip --upgrade
python -m pip install --upgrade pip
python -m pip install -r requirements/core-backend.txt
```

Optional feature sets:

```bash
# Backend tests + test client tools
python -m pip install -r requirements/dev.txt

# Tesla metadata reverse-geocoding support (overlay command)
python -m pip install -r requirements/extra-tesla.txt

# Local Qwen embedding backend
python -m pip install -r requirements/extra-local.txt

# Local backend with CUDA 4-bit quantization
python -m pip install -r requirements/extra-local-quantized.txt
```

### Configure Environment

Create a `.env` file in the project root.

Minimal variables used by the backend:

```env
EMBEDDING_BACKEND=gemini
CHUNK_DURATION=5
OVERLAP=2
GEMINI_API_KEY=your-key
```

### Run Backend API

```bash
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

API endpoints:
| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/settings` | GET/PUT | Configuration (backend, chunk duration, overlap, API key) |
| `/api/index/start` | POST | Start indexing a folder |
| `/api/index/progress/{id}` | GET (SSE) | Real-time indexing progress |
| `/api/index/cancel/{id}` | POST | Cancel an indexing job |
| `/api/search?q=...` | GET | Semantic search |
| `/api/stats` | GET | Index statistics |
| `/api/library` | GET | Indexed video library |
| `/api/history` | GET | Search history |
| `/api/video/stream/{id}` | GET | Stream a video file |
| `/api/video/trim/{id}` | GET | Extract a trimmed clip segment |

### Run Tests

```bash
HOME=$(pwd)/.tmp/test-home .venv/bin/pytest backend/tests -q
```

## CLI Status (Current)

The CLI source exists in `sentrysearch/cli.py`, but there is currently no installed `sentrysearch` console entrypoint in this repo state (`pyproject.toml`/`setup.py` is not present).

Temporary workaround:

```bash
source .venv/bin/activate
python -c "from sentrysearch.cli import cli; cli()" -- --help
```

Then replace `--help` with CLI commands, for example:

```bash
python -c "from sentrysearch.cli import cli; cli()" -- stats
```

## Web UI

The UI provides:
- **Search** — natural language query with side-by-side original/matched video playback
- **Settings** — configure backend, chunk duration, overlap, API key
- **Library** — browse indexed videos
- **History** — past searches and saved clips

## Architecture

```
sentrysearch/          Core Python library (CLI + importable API)
  chunker.py           Video chunking with FFmpeg
  embedder.py          Embedding dispatcher (Gemini / local)
  gemini_embedder.py   Google Gemini Embedding 2 backend
  local_embedder.py    Qwen3-VL local backend (Apple Silicon + NVIDIA)
  store.py             ChromaDB vector store
  search.py            Cosine similarity retrieval
  trimmer.py           FFmpeg-based clip trimming with padding
  overlay.py           Tesla SEI metadata overlay
  cli.py               Click CLI commands (module)

backend/               FastAPI REST + SSE server
  api/
    indexing.py        Indexing lifecycle (start, progress, cancel)
    search.py          Semantic search endpoint
    video.py           Video streaming and trimming
    settings.py        Configuration management
    stats.py           Index statistics
    library.py         Video library
    history.py         Search history
  tests/               pytest test suite

frontend/              Next.js 16 + React 19 web UI
  app/                 App Router pages (search, settings, library, history)
  components/          UI components (DualVideoPlayer, ClipCard, SearchBar, etc.)
  lib/                 API client, utilities
```

## Configuration

For the FastAPI backend in this repo, settings are read from:
1. Built-in defaults
2. `.env` in the project root

| Variable | Default | Description |
|---|---|---|
| `EMBEDDING_BACKEND` | `gemini` | `gemini` or `local` |
| `CHUNK_DURATION` | `5` | Seconds per chunk |
| `OVERLAP` | `2` | Overlap between chunks |
| `GEMINI_API_KEY` | — | Required for Gemini backend |

## Supported Video Formats

- `.mp4`
- `.mov`

## Project Reference

`https://github.com/ssrajadh/sentrysearch`

## License

This project is private and not yet licensed for redistribution.
