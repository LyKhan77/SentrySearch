# TODO Report

## Current Status
- Date: 2026-04-15
- Branch: `main`
- Scope completed: backend integration plan Tasks 1-3 + Indexing Lifecycle Tasks 1-3 + Stats API Task 1
- Scope in progress: Phase 5 completion
- Phase 5 ongoing: Stats API (Mock)
- Verification: `PYTHONDONTWRITEBYTECODE=1 /tmp/sentrysearch-backend-task1-venv/bin/pytest backend/tests/test_stats.py -v`
- Result: `1 passed`

## Implemented
### Phase 1: FastAPI Backend Bootstrap
- Added `backend/requirements.txt`
- Added `backend/main.py`
- Added health endpoint `GET /api/health`
- Added CORS for `http://localhost:3000`
- Added test `backend/tests/test_main.py`
- Commit: `1ae6c8e` `feat: init FastAPI backend with health check`

### Phase 2: Settings API
- Added `backend/api/settings.py`
- Added `GET /api/settings`
- Added `PUT /api/settings`
- Settings are currently stored in-memory via `current_settings`
- Added test coverage in `backend/tests/test_settings.py`
- Added test reset/isolation so settings state does not leak across tests
- Added persistence assertion so `PUT` is verified by a follow-up `GET`
- Commits:
  - `bcce114` `feat: add settings API endpoints`
  - `bfd5e6a` `fix: reset settings state in tests`
  - `f671376` `test: verify settings persist after put`

### Phase 3: Mock Indexing Start Endpoint
- Added `backend/api/indexing.py`
- Added `POST /api/index/start`
- Endpoint currently returns a generated `job_id` only
- Added test `backend/tests/test_indexing.py`
- Commit: `5bd6d24` `feat: add mock indexing start endpoint`

### Phase 4: Indexing Lifecycle
- Strengthened `POST /api/index/start` to return a real UUID `job_id`
- Added in-memory `jobs` and `job_tasks` tracking in `backend/api/indexing.py`
- Mock indexing runs on a dedicated background daemon thread so it continues after request finishes
- Task reconciliation: cancelled/failed tasks update job state; stale handles are cleaned up
- **Task 2: SSE Progress Streaming**
  - Added SSE endpoint `GET /api/index/progress/{job_id}` via `sse-starlette`
  - Yields job state (progress, status, eta, done, cancelled) as JSON in SSE events
  - Added helper for standard 404 JSON error response for missing jobs
  - Added tests for SSE stream and 404 behavior
- **Task 3: Cancel Endpoint**
  - Added `POST /api/index/cancel/{job_id}` endpoint
  - Marks job as cancelled in state and cancels the background task if still running
  - Added tests for cancellation and unknown job 404
- Commits:
  - `9253582` `feat: track mock indexing jobs`
  - `3943453` `fix: run indexing outside request loop`
- Verification: `PYTHONDONTWRITEBYTECODE=1 /tmp/sentrysearch-backend-task1-venv/bin/pytest backend/tests/test_indexing.py -v` → `7 passed`

### Phase 5: Stats API
- Added `backend/api/stats.py`
- Added `GET /api/stats`
- Stats currently return mock data (videos, chunks, db size, duration)
- Added test `backend/tests/test_stats.py`
- Commit: `feat: add mock stats API endpoint`
- Verification: `PYTHONDONTWRITEBYTECODE=1 /tmp/sentrysearch-backend-task1-venv/bin/pytest backend/tests/test_stats.py -v` → `1 passed`

## Current Backend Surface
- `GET /api/health`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/index/start`
- `GET /api/index/progress/{job_id}` (SSE)
- `POST /api/index/cancel/{job_id}`
- `GET /api/stats`

## Known Gaps
- Search, clips, original videos, library, and history endpoints not implemented yet
- Settings are still in-memory and not persisted to `.env` or another config store
- Indexing start endpoint still uses mock in-memory progress rather than real indexing work
- Current tests do not explicitly validate CORS headers

## Recent Merge Status
- Feature branch was merged back into `main`
- Temporary `.worktrees/` workspace has been removed
- Working tree was clean before this report file was added

## Next Recommended Backend Steps
1. Replace mock background progress with real SentrySearch indexing logic.
2. Implement search API and retrieval endpoints.
3. Implement library and history APIs.
4. Add stronger API tests for CORS and UUID format.

## Update Rule
- After each completed implementation step or phase, append/update this file with:
  - phase or task name
  - files added/changed
  - endpoints added/changed
  - test command run
  - test result
  - commit SHA(s)
  - remaining gaps or follow-up items
