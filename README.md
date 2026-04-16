# SentrySearch

**Developed by Lee Khan**

Semantic dashcam video search using multimodal embeddings. Index your Sentry Mode / dashcam footage, then find events with natural language queries like *"car running a red light"* or *"person walking near the driveway at night"*.

---

## 🛠 Tech Stack

- **Backend:** Python 3.12+, FastAPI, Uvicorn
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons
- **AI/ML:** 
  - **Embeddings:** Google Gemini Multimodal (Remote) or Qwen2-VL (Local)
  - **Vector Store:** ChromaDB
- **Media Processing:** FFmpeg
- **Database:** SQLite (Search History & Metadata)

---

## 🚀 How It Works

1. **Index** — Videos are split into overlapping chunks, embedded using multimodal models, and stored in ChromaDB.
2. **Search** — Natural language queries are embedded similarly; the system retrieves the most relevant video segments via cosine similarity.
3. **Trim** — Matching segments are extracted with configurable padding for instant side-by-side playback or download.

---

## 📥 Installation

All dependencies are managed from the project root using a single virtual environment.

### 1. Prerequisites
- Python 3.12+
- Node.js 20+
- [FFmpeg](https://ffmpeg.org/) installed and available in system PATH.

### 2. Setup Repository & Environment
```bash
# Clone the repository
git clone https://github.com/ssrajadh/sentrysearch.git
cd sentrysearch

# Create and activate a single root virtual environment
python3 -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows

# Upgrade pip and install core dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements/core-backend.txt
```

### 3. Optional Feature Sets
Depending on your hardware and needs:
```bash
# Developer tools & tests
python -m pip install -r requirements/dev.txt

# Local Qwen embedding backend (Requires high VRAM/Apple Silicon)
python -m pip install -r requirements/extra-local.txt

# Tesla SEI metadata support (Reverse-geocoding)
python -m pip install -r requirements/extra-tesla.txt
```

---

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
# Backend Selection: 'gemini' or 'local'
EMBEDDING_BACKEND=gemini
GEMINI_API_KEY=your_google_gemini_api_key

# Chunker Settings
CHUNK_DURATION=5
OVERLAP=2
```

---

## 🏃 Running the Application

### Start Backend (FastAPI)
```bash
source .venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8002
```

### Start Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Access the UI at: `http://localhost:3002`

---

## 🌐 Cross-Device Access

To access SentrySearch from other devices on your network:

### 1. Find your Mac Mini's IP address:
```bash
ipconfig getifaddr en0
# Example: 192.168.1.100
```

### 2. Update Frontend Environment:
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://YOUR_MAC_IP:8002/api
```
Example:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:8002/api
```

### 3. Access from other devices:
- **Frontend**: `http://YOUR_MAC_IP:3002`
- **Backend API**: `http://YOUR_MAC_IP:8002`

### Example:
If your Mac Mini IP is `192.168.1.100`:
- Open browser on any device: `http://192.168.1.100:3002`
- The backend is already configured to accept connections from any origin

---

## 💻 CLI Usage

While the application is primarily web-based, you can interact with the core engine via CLI:

```bash
source .venv/bin/activate
# Run via python module execution
python -c "from sentrysearch.cli import cli; cli()" -- --help
```

Example: Check indexing stats
```bash
python -c "from sentrysearch.cli import cli; cli()" -- stats
```

---

## 📁 Project Architecture

```text
sentrysearch/          # Core Engine (Logic & ML)
  chunker.py           # FFmpeg video splitting
  embedder.py          # Embedding dispatcher
  store.py             # ChromaDB integration
  trimmer.py           # Clip extraction logic

backend/               # FastAPI REST & SSE Server
  api/                 # Endpoint definitions
  tests/               # Pytest suite

frontend/              # Next.js Web Interface
  app/                 # App Router (Pages)
  components/          # UI Components (DualVideoPlayer, etc.)

requirements/          # Consolidated dependency lists
```

---

## 📜 License & Reference

**Project Reference:** [https://github.com/ssrajadh/sentrysearch](https://github.com/ssrajadh/sentrysearch)

This project is private and developed for semantic video retrieval. All rights reserved by **Lee Khan**.
