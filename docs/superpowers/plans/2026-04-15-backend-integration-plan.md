# Backend API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a FastAPI backend that wraps the core SentrySearch Python logic and provides REST endpoints + SSE for the Next.js UI.

**Architecture:** A FastAPI application serving at `localhost:8000`. It will use CORS to allow the frontend to connect. It will expose REST endpoints for settings, library management, and search, and an SSE endpoint for streaming indexing progress.

**Tech Stack:** Python, FastAPI, Uvicorn, pydantic, sse-starlette, pytest.

---

### Task 1: Setup FastAPI Project & Dependencies

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/main.py`
- Create: `backend/tests/test_main.py`

- [ ] **Step 1: Write the failing test for health check**

```python
# backend/tests/test_main.py
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_main.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'backend'"

- [ ] **Step 3: Write minimal implementation and requirements**

```txt
# backend/requirements.txt
fastapi==0.110.0
uvicorn==0.28.0
pydantic==2.6.3
sse-starlette==2.0.0
pytest==8.1.1
httpx==0.27.0
```

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SentrySearch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 4: Install dependencies and run test to verify it passes**

Run: `pip install -r backend/requirements.txt`
Run: `pytest backend/tests/test_main.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/requirements.txt backend/main.py backend/tests/test_main.py
git commit -m "feat: init FastAPI backend with health check"
```

### Task 2: Implement Settings API

**Files:**
- Create: `backend/api/settings.py`
- Modify: `backend/main.py:10-18`
- Create: `backend/tests/test_settings.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_settings.py
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_settings():
    response = client.get("/api/settings")
    assert response.status_code == 200
    assert "model" in response.json()

def test_update_settings():
    payload = {"model": "qwen3-vl", "chunk_duration": 20, "overlap": 5}
    response = client.put("/api/settings", json=payload)
    assert response.status_code == 200
    assert response.json()["chunk_duration"] == 20
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_settings.py -v`
Expected: FAIL with 404 Not Found

- [ ] **Step 3: Write minimal implementation**

```python
# backend/api/settings.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Settings(BaseModel):
    model: str = "qwen3-vl"
    chunk_duration: int = 15
    overlap: int = 3

# Mock in-memory state for now
current_settings = Settings()

@router.get("/settings")
def get_settings():
    return current_settings

@router.put("/settings")
def update_settings(settings: Settings):
    global current_settings
    current_settings = settings
    return current_settings
```

Modify `backend/main.py` to include the router:
```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import settings

app = FastAPI(title="SentrySearch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(settings.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_settings.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/api/settings.py backend/main.py backend/tests/test_settings.py
git commit -m "feat: add settings API endpoints"
```

### Task 3: Implement Indexing SSE Endpoint (Mock)

**Files:**
- Create: `backend/api/indexing.py`
- Modify: `backend/main.py:16-17`
- Create: `backend/tests/test_indexing.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_indexing.py
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_start_indexing():
    response = client.post("/api/index/start", json={"folder_path": "/tmp/vids"})
    assert response.status_code == 200
    assert "job_id" in response.json()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_indexing.py -v`
Expected: FAIL with 404 Not Found

- [ ] **Step 3: Write minimal implementation**

```python
# backend/api/indexing.py
from fastapi import APIRouter
from pydantic import BaseModel
import uuid

router = APIRouter()

class IndexRequest(BaseModel):
    folder_path: str

@router.post("/index/start")
def start_indexing(req: IndexRequest):
    job_id = str(uuid.uuid4())
    # In a real app, spawn background task here
    return {"job_id": job_id}
```

Modify `backend/main.py` to include the router:
```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import settings, indexing

app = FastAPI(title="SentrySearch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(settings.router, prefix="/api")
app.include_router(indexing.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_indexing.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/api/indexing.py backend/main.py backend/tests/test_indexing.py
git commit -m "feat: add mock indexing start endpoint"
```
