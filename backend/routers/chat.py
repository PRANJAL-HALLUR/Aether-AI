from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.config import Settings, get_settings
from backend.llm.factory import get_llm_provider
from backend.schemas.chat import ChatRequest
from backend.services.chat_service import ChatService

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat")
@limiter.limit("60/minute")
async def chat_endpoint(
    request: Request,
    payload: ChatRequest,
    settings: Settings = Depends(get_settings),
):
    """
    Primary chat endpoint. Accepts a user message, loads conversation history,
    calls the active LLM provider, streams tokens back token-by-token via SSE,
    and automatically saves both user and assistant messages in SQLite.
    """
    provider = get_llm_provider(settings)
    chat_service = ChatService(provider=provider, settings=settings)

    generator = chat_service.stream_chat_response(
        conversation_id=payload.conversation_id,
        user_message=payload.message,
    )

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        },
    )
