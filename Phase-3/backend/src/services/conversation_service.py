"""Conversation service for managing chat sessions."""

from typing import List, Optional
from datetime import datetime
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.conversation import Conversation
from src.models.message import Message


async def create_conversation(session: AsyncSession, user_id: str) -> Conversation:
    """Create a new conversation for a user."""
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)
    return conversation


async def get_conversation_by_id(
    session: AsyncSession, 
    conversation_id: int, 
    user_id: str
) -> Optional[Conversation]:
    """Get a specific conversation for a user."""
    statement = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    )
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def get_user_conversations(
    session: AsyncSession, 
    user_id: str
) -> List[Conversation]:
    """Get all conversations for a user."""
    statement = select(Conversation).where(Conversation.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().all()


async def get_conversation_history(
    session: AsyncSession, 
    conversation_id: int
) -> List[dict]:
    """Get all messages in a conversation."""
    statement = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc())
    result = await session.execute(statement)
    messages = result.scalars().all()
    
    return [
        {
            "role": msg.role,
            "content": msg.content,
            "timestamp": msg.created_at.isoformat()
        }
        for msg in messages
    ]