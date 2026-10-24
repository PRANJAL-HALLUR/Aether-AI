import os
from functools import lru_cache
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    LLM_PROVIDER: str = "mock"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    DATABASE_URL: str = "sqlite+aiosqlite:///./aether_chat.db"
    
    RATE_LIMIT_PER_MINUTE: int = 60
    MAX_MESSAGE_LENGTH: int = 4000

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def get_system_prompt(self) -> str:
        prompt_path = BASE_DIR / "prompts" / "system_prompt.md"
        if prompt_path.exists():
            try:
                return prompt_path.read_text(encoding="utf-8")
            except Exception:
                pass
        return "You are Aether, a sophisticated and helpful AI assistant."

@lru_cache()
def get_settings() -> Settings:
    return Settings()
