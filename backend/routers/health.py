from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config import Settings, get_settings
from backend.database import get_db
from backend.schemas.chat import HealthResponse

router = APIRouter(prefix="/api", tags=["System"])

@router.get("/health", response_model=HealthResponse)
async def health_check(
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings)
):
    """
    Health check endpoint verifying application runtime,
    active LLM provider configuration, and database connectivity.
    """
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        provider=settings.LLM_PROVIDER,
        database=db_status,
        version="1.0.0"
    )
