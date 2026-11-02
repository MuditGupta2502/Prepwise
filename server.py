from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

app = FastAPI(title="Prepwise API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)
app.mount("/vendor", StaticFiles(directory=ROOT / "vendor"), name="vendor")


class TutorMessage(BaseModel):
    role: str = "user"
    content: str = Field(default="", max_length=1200)


class TutorRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1200)
    track: str = "all"
    history: list[TutorMessage] = Field(default_factory=list, max_length=20)


@app.get("/api/health")
async def health() -> dict[str, Any]:
    provider = os.getenv("AI_PROVIDER") or (
        "gemini" if os.getenv("GEMINI_API_KEY") else
        "openai" if os.getenv("OPENAI_API_KEY") else
        "ollama" if os.getenv("AI_PROVIDER") == "ollama" else "demo"
    )
    return {
        "ok": True,
        "aiConfigured": bool(os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY") or provider == "ollama"),
        "vectorConfigured": bool(os.getenv("DATABASE_URL")),
        "provider": provider,
    }


@app.post("/api/tutor")
async def tutor(request: TutorRequest) -> dict[str, Any]:
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Ask a question up to 1,200 characters long.")
    from ai.tutor import ask_tutor

    history = [
        {"role": "assistant" if message.role == "assistant" else "user", "content": message.content.strip()}
        for message in request.history[-6:]
        if message.content.strip()
    ]
    try:
        return await ask_tutor(question, request.track, history)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error) or "The tutor could not answer just now.") from error


@app.get("/")
async def home() -> FileResponse:
    return FileResponse(ROOT / "index.html")


@app.get("/content/curriculum.json")
async def curriculum() -> FileResponse:
    return FileResponse(ROOT / "content" / "curriculum.json", media_type="application/json")


@app.get("/{asset_path:path}")
async def frontend_asset(asset_path: str) -> FileResponse:
    allowed_root_assets = {"app.js", "tracks.js", "styles.css", "favicon.ico"}
    if asset_path not in allowed_root_assets:
        raise HTTPException(status_code=404, detail="Not found")
    target = (ROOT / asset_path).resolve()
    if not target.is_file() or ROOT not in target.parents:
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(target)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="127.0.0.1", port=int(os.getenv("PORT", "8000")), reload=True)
