"""Tests for conversation management functionality."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.services.conversation_service import (
    create_conversation,
    get_conversation_by_id,
    get_user_conversations,
    get_conversation_history
)
from src.services.message_service import save_message, save_assistant_message
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.user import User


@pytest.mark.asyncio
async def test_create_conversation(test_db_session: AsyncSession, sample_user: User):
    """Test creating a new conversation."""
    conversation = await create_conversation(test_db_session, sample_user.id)
    
    assert conversation is not None
    assert conversation.user_id == sample_user.id
    
    # Verify it was saved to the database
    result = await test_db_session.execute(
        select(Conversation).where(Conversation.id == conversation.id)
    )
    saved_conversation = result.scalar_one_or_none()
    assert saved_conversation is not None
    assert saved_conversation.user_id == sample_user.id


@pytest.mark.asyncio
async def test_get_conversation_by_id(test_db_session: AsyncSession, sample_user: User):
    """Test retrieving a conversation by ID."""
    # Create a conversation first
    created_conversation = await create_conversation(test_db_session, sample_user.id)
    
    # Retrieve it by ID
    retrieved_conversation = await get_conversation_by_id(
        test_db_session, 
        created_conversation.id, 
        sample_user.id
    )
    
    assert retrieved_conversation is not None
    assert retrieved_conversation.id == created_conversation.id
    assert retrieved_conversation.user_id == sample_user.id


@pytest.mark.asyncio
async def test_get_conversation_by_id_wrong_user(test_db_session: AsyncSession, sample_user: User):
    """Test that users can't access other users' conversations."""
    # Create a conversation for the sample user
    created_conversation = await create_conversation(test_db_session, sample_user.id)
    
    # Try to retrieve it with a different user ID
    retrieved_conversation = await get_conversation_by_id(
        test_db_session, 
        created_conversation.id, 
        "different-user-id"
    )
    
    # Should return None because it doesn't belong to the user
    assert retrieved_conversation is None


@pytest.mark.asyncio
async def test_get_user_conversations(test_db_session: AsyncSession, sample_user: User):
    """Test retrieving all conversations for a user."""
    # Create multiple conversations for the user
    conv1 = await create_conversation(test_db_session, sample_user.id)
    conv2 = await create_conversation(test_db_session, sample_user.id)
    
    # Retrieve all conversations for the user
    user_conversations = await get_user_conversations(test_db_session, sample_user.id)
    
    assert len(user_conversations) == 2
    conversation_ids = [conv.id for conv in user_conversations]
    assert conv1.id in conversation_ids
    assert conv2.id in conversation_ids
    
    # Verify all belong to the correct user
    for conv in user_conversations:
        assert conv.user_id == sample_user.id


@pytest.mark.asyncio
async def test_get_conversation_history(test_db_session: AsyncSession, sample_user: User):
    """Test retrieving conversation history."""
    # Create a conversation
    conversation = await create_conversation(test_db_session, sample_user.id)
    
    # Add some messages to the conversation
    await save_message(
        test_db_session,
        sample_user.id,
        conversation.id,
        "user",
        "Hello, AI!"
    )
    
    await save_assistant_message(
        test_db_session,
        sample_user.id,
        conversation.id,
        "Hello, user! How can I help?"
    )
    
    await save_message(
        test_db_session,
        sample_user.id,
        conversation.id,
        "user",
        "Can you add a task?"
    )
    
    # Retrieve the conversation history
    history = await get_conversation_history(test_db_session, conversation.id)
    
    assert len(history) == 3
    
    # Check the content and roles
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "Hello, AI!"
    
    assert history[1]["role"] == "assistant"
    assert history[1]["content"] == "Hello, user! How can I help?"
    
    assert history[2]["role"] == "user"
    assert history[2]["content"] == "Can you add a task?"


@pytest.mark.asyncio
async def test_conversation_history_order(test_db_session: AsyncSession, sample_user: User):
    """Test that conversation history is returned in chronological order."""
    # Create a conversation
    conversation = await create_conversation(test_db_session, sample_user.id)
    
    # Add messages in a specific order
    await save_message(
        test_db_session,
        sample_user.id,
        conversation.id,
        "user",
        "First message"
    )
    
    await save_assistant_message(
        test_db_session,
        sample_user.id,
        conversation.id,
        "First response"
    )
    
    await save_message(
        test_db_session,
        sample_user.id,
        conversation.id,
        "user",
        "Second message"
    )
    
    # Retrieve the conversation history
    history = await get_conversation_history(test_db_session, conversation.id)
    
    assert len(history) == 3
    assert history[0]["content"] == "First message"
    assert history[1]["content"] == "First response"
    assert history[2]["content"] == "Second message"


@pytest.mark.asyncio
async def test_empty_conversation_history(test_db_session: AsyncSession, sample_user: User):
    """Test retrieving history for a conversation with no messages."""
    # Create a conversation
    conversation = await create_conversation(test_db_session, sample_user.id)
    
    # Retrieve the conversation history (should be empty)
    history = await get_conversation_history(test_db_session, conversation.id)
    
    assert len(history) == 0


@pytest.mark.asyncio
async def test_conversation_belongs_to_correct_user(test_db_session: AsyncSession, sample_user: User):
    """Test that conversations are properly associated with users."""
    # Create conversations for different users (using the same user for this test)
    conversation = await create_conversation(test_db_session, sample_user.id)
    
    # Verify the conversation belongs to the correct user
    retrieved_conversation = await get_conversation_by_id(
        test_db_session,
        conversation.id,
        sample_user.id
    )
    
    assert retrieved_conversation is not None
    assert retrieved_conversation.user_id == sample_user.id


@pytest.mark.asyncio
async def test_conversation_timestamps(test_db_session: AsyncSession, sample_user: User):
    """Test that conversation timestamps are properly set."""
    from datetime import datetime
    
    # Create a conversation
    conversation = await create_conversation(test_db_session, sample_user.id)
    
    # Verify timestamps are set
    assert conversation.created_at is not None
    assert conversation.updated_at is not None
    assert isinstance(conversation.created_at, datetime)
    assert isinstance(conversation.updated_at, datetime)
    
    # created_at and updated_at should be close in time for a new conversation
    time_diff = abs((conversation.updated_at - conversation.created_at).total_seconds())
    assert time_diff < 1  # Less than 1 second difference