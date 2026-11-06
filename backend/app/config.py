from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load both backend/.env and root .env
load_dotenv(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def gemini_api_keys() -> list[str]:
    values = [
        os.getenv("GEMINI_API_KEY"),
        *(os.getenv(f"GEMINI_API_KEY_{index}") for index in range(2, 8)),
    ]
    values.extend(os.getenv("GEMINI_API_KEYS", "").split(","))
    return [value.strip() for value in values if value and value.strip()]


def gemini_model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def max_upload_bytes() -> int:
    try:
        return int(os.getenv("MAX_UPLOAD_BYTES", 10 * 1024 * 1024))
    except (ValueError, TypeError):
        return 10 * 1024 * 1024


def cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    origins = [orig.strip() for orig in raw.split(",") if orig.strip()]
    if not origins:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://localhost:4173",
        ]
    return origins


