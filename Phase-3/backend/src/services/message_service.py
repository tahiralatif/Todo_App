"""Message service for managing chat messages."""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.message import Message


async def save_message(
    session: AsyncSession,
    user_id: str,
    conversation_id: int,
    role: str,
    content: str
) -> Message:
    """Save a new message to the database."""
    message = Message(
        user_id=user_id,
        conversation_id=conversation_id,
        role=role,
        content=content
    )
    session.add(message)
    await session.commit()
    await session.refresh(message)
    return message


async def save_assistant_message(
    session: AsyncSession,
    user_id: str,
    conversation_id: int,
    content: str,
    tool_calls: Optional[List[Dict[str, Any]]] = None
) -> Message:
    """Save an assistant message to the database."""
    message = Message(
        user_id=user_id,
        conversation_id=conversation_id,
        role="assistant",
        content=content
    )
    session.add(message)
    await session.commit()
    await session.refresh(message)
    return message


async def get_message_by_id(
    session: AsyncSession, 
    message_id: int, 
    user_id: str
) -> Optional[Message]:
    """Get a specific message for a user."""
    statement = select(Message).where(
        Message.id == message_id,
        Message.user_id == user_id
    )
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def get_messages_for_conversation(
    session: AsyncSession, 
    conversation_id: int,
    user_id: str
) -> List[Message]:
    """Get all messages for a specific conversation."""
    statement = select(Message).where(
        Message.conversation_id == conversation_id,
        Message.user_id == user_id
    ).order_by(Message.created_at.asc())
    result = await session.execute(statement)
    return result.scalars().all()


async def update_message_content(
    session: AsyncSession,
    message_id: int,
    user_id: str,
    new_content: str
) -> Optional[Message]:
    """Update the content of an existing message."""
    message = await get_message_by_id(session, message_id, user_id)
    if message:
        message.content = new_content
        message.updated_at = datetime.now()
        await session.commit()
        await session.refresh(message)
    return message


async def delete_message(
    session: AsyncSession,
    message_id: int,
    user_id: str
) -> bool:
    """Delete a message from the database."""
    message = await get_message_by_id(session, message_id, user_id)
    if message:
        await session.delete(message)
        await session.commit()
        return True
    return False