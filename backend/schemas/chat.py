from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = Field(
        default=None,
        description="UUID of an existing conversation or None to start a new one"
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="User message content"
    )

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty or only whitespace")
        return stripped

class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    rating: Optional[Literal["up", "down"]] = None
    created_at: datetime

class ConversationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageRead] = []

class FeedbackRequest(BaseModel):
    rating: Optional[Literal["up", "down"]] = None

class HealthResponse(BaseModel):
    status: str
    provider: str
    database: str
    version: str
