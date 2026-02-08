from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .user import User
    from .message import Message


class ConversationBase(SQLModel):
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Conversation(ConversationBase, table=True):
    __tablename__ = "conversations"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, foreign_key="users.id")
    
    # Relationship to user and messages
    user: "User" = Relationship(back_populates="conversations")
    messages: list["Message"] = Relationship(back_populates="conversation")
    
    # Update updated_at on modification
    def __setattr__(self, name, value):
        super().__setattr__(name, value)
        if name in ["updated_at"]:
            super().__setattr__("updated_at", datetime.now())