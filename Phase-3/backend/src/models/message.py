from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .user import User
    from .conversation import Conversation


class MessageBase(SQLModel):
    user_id: str = Field(index=True)
    conversation_id: int = Field(index=True)
    role: str = Field(regex="^(user|assistant)$")  # Either 'user' or 'assistant'
    content: str
    created_at: datetime = Field(default_factory=datetime.now)


class Message(MessageBase, table=True):
    __tablename__ = "messages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, foreign_key="users.id")
    conversation_id: int = Field(index=True, foreign_key="conversations.id")
    role: str = Field(regex="^(user|assistant)$")  # Either 'user' or 'assistant'
    content: str
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    user: "User" = Relationship(back_populates="messages")
    conversation: "Conversation" = Relationship(back_populates="messages")