# SentrySearch Agent Guide

## 1. Project Identity & Context
- **Project Vision:** A semantic video search system for dashcam/Sentry Mode footage using multimodal embeddings (Google Gemini Embedding 2 or local Qwen-VL).
- **Core Tech Stack:** 
  - **Backend:** FastAPI (Python 3.12+), Uvicorn.
  - **Frontend:** Next.js 16 (React 19), Tailwind CSS, shadcn/ui.
  - **Data:** ChromaDB (Vector Store), SQLite (History).
  - **Media:** FFmpeg for chunking and trimming processing.
- **Mental Model:** The system operates asynchronously; heavy indexing tasks are performed in a background thread, streaming progress to the UI via Server-Sent Events (SSE).

## 2. Workflow & Guardrails
- **Testing Protocol:** Always run `pytest backend/tests` to verify changes to core logic or the API before committing.
- **Media Processing Consistency:** Avoid calling raw FFmpeg commands directly via subprocess. Use the internal libraries in `sentrysearch/trimmer.py` or `chunker.py` to maintain consistent parameters (codecs, overlays, etc.).
- **Development Ports:** Backend defaults to port `8002`, and Frontend to port `3002`.
- **Environment Awareness:** Check the `EMBEDDING_BACKEND` variable in the `.env` file to determine if the system is running in `gemini` or `local` mode.

## 3. Agent-Specific Instructions
- **SSE Awareness:** Indexing progress is handled via Server-Sent Events. Ensure any modifications to the indexing endpoint maintain the correct streaming format to prevent UI disconnection.
- **Cost & Resource Sensitivity:** 
  - If using the Gemini backend, provide a cost estimate before initiating large indexing processes.
  - If using the Local backend, be mindful of system VRAM/RAM consumption.

## 4. Important Operational Notes (Existing Rules)
- **File Management:** Create a dedicated folder every time you perform testing, crawling, or similar activities that generate files. Be sure to add them to `.gitignore` if the files are unrelated or do not affect the core system functionality.
- **Communication:** Whenever you have a question, use the Questions Tools Agent so users don’t have to retype it.
- **Skill Usage:** Use the necessary skills to perform a task.
- **Planning & Build Mode:**
  - In planning mode, focus on creating the plan and addressing questions.
  - Once you’re done, ask the user for approval to move on to build mode.
  - Request approval to switch modes when in planning mode but want to add a small detail.
