from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import indexing, library, settings, stats, history


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(settings.router, prefix="/api")
app.include_router(indexing.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(library.router, prefix="/api")
app.include_router(history.router, prefix="/api")


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
