"""Application configuration.

Settings are read from environment variables (and a local ``.env`` file when
present). Secrets such as ``GROQ_API_KEY`` live ONLY here / in the environment –
never hard-coded and never committed.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Database ---
    database_url: str = "sqlite:///./fireflies.db"

    # --- Groq (LLM) ---
    # Empty by default so the app runs fully offline with a mock fallback.
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # --- CORS / frontend ---
    # Production frontend origin (the Vercel URL). Localhost is always allowed.
    frontend_url: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """Explicit allowlist: local dev origins plus the configured frontend."""
        origins = {
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        }
        if self.frontend_url:
            origins.add(self.frontend_url.rstrip("/"))
        return sorted(origins)

    # Allow any Vercel preview/production deployment without re-configuring.
    cors_origin_regex: str = r"https://.*\.vercel\.app"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
