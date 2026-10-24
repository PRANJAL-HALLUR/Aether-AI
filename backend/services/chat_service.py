import json
import logging
import uuid
from typing import AsyncGenerator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config import Settings
from backend.database import AsyncSessionLocal
from backend.llm.base import BaseLLMProvider
from backend.models.conversation import Conversation
from backend.models.message import Message

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self, provider: BaseLLMProvider, settings: Settings):
        self.provider = provider
        self.settings = settings

    async def stream_chat_response(
        self,
        conversation_id: str | None,
        user_message: str
    ) -> AsyncGenerator[str, None]:
        """
        Processes a chat request, records the user message in DB,
        streams LLM chunks via Server-Sent Events (SSE), and commits
        the final assistant message to the database.
        """
        # Open an independent database session for the duration of streaming lifecycle
        async with AsyncSessionLocal() as session:
            try:
                # 1. Resolve or create conversation
                conversation: Conversation | None = None
                is_new_conversation = False

                if conversation_id:
                    result = await session.execute(
                        select(Conversation).where(Conversation.id == conversation_id)
                    )
                    conversation = result.scalar_one_or_none()

                if not conversation:
                    is_new_conversation = True
                    # Auto-generate a clean title from the initial prompt
                    title = user_message[:42].strip()
                    if len(user_message) > 42:
                        title += "..."
                    conversation = Conversation(
                        id=conversation_id or str(uuid.uuid4()),
                        title=title or "New Conversation"
                    )
                    session.add(conversation)
                    await session.flush()

                # 2. Add and commit user message
                user_msg_record = Message(
                    conversation_id=conversation.id,
                    role="user",
                    content=user_message
                )
                session.add(user_msg_record)
                await session.commit()

                # 3. Fetch full conversation history
                history_result = await session.execute(
                    select(Message)
                    .where(Message.conversation_id == conversation.id)
                    .order_by(Message.created_at.asc())
                )
                messages_history = [
                    {"role": m.role, "content": m.content}
                    for m in history_result.scalars().all()
                ]

                # 4. Generate assistant message ID upfront
                assistant_msg_id = str(uuid.uuid4())

                # 5. Emit 'start' event with metadata
                start_payload = {
                    "type": "start",
                    "conversation_id": conversation.id,
                    "title": conversation.title,
                    "user_message_id": user_msg_record.id,
                    "assistant_message_id": assistant_msg_id,
                    "is_new": is_new_conversation
                }
                yield f"data: {json.dumps(start_payload)}\n\n"

                # 6. Stream tokens from the LLM provider
                system_prompt = self.settings.get_system_prompt()
                full_assistant_reply: list[str] = []

                async for token in self.provider.stream_chat(messages_history, system_prompt):
                    full_assistant_reply.append(token)
                    chunk_payload = {
                        "type": "chunk",
                        "content": token
                    }
                    yield f"data: {json.dumps(chunk_payload)}\n\n"

                # 7. Persist assistant reply in database
                complete_text = "".join(full_assistant_reply).strip()
                if not complete_text:
                    complete_text = "I received your message."

                assistant_msg_record = Message(
                    id=assistant_msg_id,
                    conversation_id=conversation.id,
                    role="assistant",
                    content=complete_text
                )
                session.add(assistant_msg_record)
                await session.commit()

                # 8. Emit 'end' event
                end_payload = {
                    "type": "end",
                    "conversation_id": conversation.id,
                    "message_id": assistant_msg_id,
                    "full_content": complete_text
                }
                yield f"data: {json.dumps(end_payload)}\n\n"

            except Exception as e:
                logger.error(f"Error in chat stream pipeline: {str(e)}", exc_info=True)
                error_payload = {
                    "type": "error",
                    "error": f"Stream processing failed: {str(e)}"
                }
                yield f"data: {json.dumps(error_payload)}\n\n"
