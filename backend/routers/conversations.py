from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from backend.database import get_db
from backend.models.conversation import Conversation
from backend.models.message import Message
from backend.schemas.chat import (
    ConversationRead,
    ConversationSummary,
    FeedbackRequest,
    MessageRead,
)

router = APIRouter(prefix="/api", tags=["Conversations"])

@router.get("/conversations", response_model=List[ConversationSummary])
async def list_conversations(
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all conversations ordered by most recently updated,
    including the total count of messages in each.
    """
    stmt = (
        select(
            Conversation.id,
            Conversation.title,
            Conversation.created_at,
            Conversation.updated_at,
            func.count(Message.id).label("message_count"),
        )
        .outerjoin(Message, Conversation.id == Message.conversation_id)
        .group_by(Conversation.id)
        .order_by(Conversation.updated_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        ConversationSummary(
            id=row.id,
            title=row.title,
            created_at=row.created_at,
            updated_at=row.updated_at,
            message_count=row.message_count,
        )
        for row in rows
    ]

@router.get("/conversations/{conversation_id}", response_model=ConversationRead)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a specific conversation along with all its chronological messages.
    """
    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found",
        )

    return conversation

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_200_OK)
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently delete a conversation and all its associated messages.
    """
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found",
        )

    await db.delete(conversation)
    await db.commit()

    return {"status": "success", "message": f"Conversation {conversation_id} deleted"}

@router.patch("/messages/{message_id}/feedback", response_model=MessageRead)
async def update_message_feedback(
    message_id: str,
    feedback: FeedbackRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Update thumbs up/down rating on an assistant message.
    """
    stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(stmt)
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message '{message_id}' not found",
        )

    msg.rating = feedback.rating
    await db.commit()
    await db.refresh(msg)
    return msg
