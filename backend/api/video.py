import os
from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

router = APIRouter()

# Placeholder for real storage path
VIDEO_STORAGE_PATH = "backend/assets"

@router.get("/stream/{video_id}")
async def stream_video(video_id: str):
    file_path = os.path.join(VIDEO_STORAGE_PATH, video_id)
    if not os.path.exists(file_path):
        return JSONResponse(
            status_code=404,
            content={"error": "Video not found", "details": f"File {video_id} not found."}
        )
    return FileResponse(file_path, media_type="video/mp4")
