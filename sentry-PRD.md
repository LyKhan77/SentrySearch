**Project Specification: UI Integration for SentrySearch**

**Version:** 1.0  
**Date:** April 13, 2026  
**Prepared by:** Grok (on behalf of user request)  
**Project Name:** SentrySearch UI (Web/Desktop Interface)

### 1. Project Overview
SentrySearch is currently a powerful **command-line tool** for semantic video search using either Google Gemini Embedding 2 or a fully local Qwen3-VL model. It indexes video footage (dashcam, Sentry Mode, etc.) into ChromaDB and allows natural-language queries to retrieve and trim matching clips.

This project aims to **add a modern, user-friendly graphical user interface (UI)** on top of the existing core functionality so non-technical users can index, search, manage, and preview results without using the terminal.

The UI will wrap the existing Python codebase (no major rewrite of the core engine) while keeping full compatibility with both Gemini and local backends.

### 2. Objectives
- Make SentrySearch accessible to users who prefer graphical interfaces.
- Provide real-time feedback during indexing and searching.
- Enable easy management of indexes, video libraries, and search results.
- Support previewing of original videos and generated clips directly in the UI.
- Maintain 100% feature parity with the current CLI.
- Keep the solution lightweight, privacy-friendly, and runnable locally.

### 3. Scope
**In Scope:**
- Web-based UI (primary) + optional desktop wrapper.
- Full support for both Gemini and local Qwen3-VL backends.
- All existing CLI commands (`init`, `index`, `search`, `stats`, `remove`, `reset`).
- Video upload/indexing with progress tracking.
- Natural language search with result preview and clip download.
- Index management dashboard.
- Basic video player for original footage and generated clips.
- Tesla metadata overlay toggle.

**Out of Scope (Phase 1):**
- Real-time streaming / live camera feed processing.
- Multi-user / cloud deployment.
- Advanced video editing features.
- Mobile app (iOS/Android).

### 4. Functional Requirements

| Feature | Description | Priority |
|---------|-------------|----------|
| Dashboard | Overview of indexed videos, total chunks, storage usage, and recent searches | High |
| Index Manager | Upload/select folders, start indexing, view progress, cancel, show stats | High |
| Search Interface | Text input for natural-language query, backend/model selector, threshold slider, results list with similarity scores | High |
| Result Viewer | Play original video + trimmed clip side-by-side, download clip, apply Tesla overlay | High |
| Library Browser | Browse all indexed videos with thumbnails and metadata | Medium |
| Settings | Configure chunk duration, overlap, preprocessing options, output directory, API key | High |
| History | Saved searches and previously generated clips | Medium |

### 5. Non-Functional Requirements
- **Performance**: Indexing progress should update in real-time (WebSocket or SSE).
- **Usability**: Responsive design, dark/light mode, intuitive for non-developers.
- **Security**: Run fully locally (no data leaves the machine unless user chooses Gemini).
- **Compatibility**: Work on macOS, Windows, Linux (with local backend support for Apple Silicon & NVIDIA).
- **Extensibility**: Easy to add new embedding models in the future.
- **Resource Awareness**: Show GPU/CPU usage and estimated cost (for Gemini).

### 6. Proposed Architecture
- **Backend**: FastAPI (Python) – lightweight REST + WebSocket API that directly calls SentrySearch core functions.
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui components (modern, fast, great video support).
- **Alternative (simpler MVP)**: Streamlit or Gradio (if you want a very quick prototype in < 1 week).
- **Database**: Reuse existing ChromaDB (no change needed).
- **Video Processing**: Reuse FFmpeg calls from the original codebase.
- **Desktop Option**: Tauri (Rust + web frontend) for a native-feeling app with zero-install experience.

**Integration Strategy with SentrySearch**  
- Do **not** rely on CLI subprocess calls (slow and brittle).  
- Refactor minimally: expose the core modules (`indexer.py`, `searcher.py`, `embedder.py`, etc.) as importable Python functions.  
- Backend will import and call these functions directly.  
- All configuration (`.env`, ChromaDB path, etc.) remains exactly the same.

### 7. Tech Stack Recommendation
| Layer       | Technology                          | Reason |
|-------------|-------------------------------------|------|
| Backend     | FastAPI + Uvicorn                   | Async, Python-native |
| Frontend    | Next.js 15 + TypeScript + Tailwind  | Modern, excellent DX |
| UI Library  | shadcn/ui + Radix + Lucide icons    | Beautiful, accessible |
| Video Player| Video.js or native HTML5 + Plyr     | Good controls & thumbnails |
| State Mgmt  | Zustand or React Query              | Simple & efficient |
| Packaging   | Tauri (optional) or Docker          | Easy distribution |

### 8. Development Phases & Milestones
**Phase 1 (MVP – 2–3 weeks)**  
- Backend API wrapping all CLI commands  
- Basic dashboard + index + search UI  
- Video preview & clip download  

**Phase 2 (Polish – 1–2 weeks)**  
- Progress tracking, history, settings, Tesla overlay  
- Responsive design & dark mode  

**Phase 3 (Desktop & Extras)**  
- Tauri build  
- Advanced filters, batch operations  

### 9. Assumptions & Risks
- Assumption: The user has basic Python/FFmpeg environment already set up (same as current SentrySearch).
- Risk: Local Qwen3-VL model memory usage on lower-end hardware → UI should warn users.
- Risk: Gemini API rate limits → UI must show clear cost estimates.

# Reference
`https://github.com/ssrajadh/sentrysearch`