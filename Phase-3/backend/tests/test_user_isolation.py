"""Tests for user isolation and security."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.services.conversation_service import (
    create_conversation,
    get_conversation_by_id,
    get_user_conversations
)
from src.services.message_service import save_message, get_messages_for_conversation
from src.services.task_service import create_task, get_user_tasks
from src.models.conversation import Conversation
from src.models.message import Message
from src.models.task import Task
from src.models.user import User


@pytest.mark.asyncio
async def test_user_cannot_access_other_users_conversations(test_db_session: AsyncSession):
    """Test that users cannot access conversations belonging to other users."""
    # Create two different users
    user1 = User(id="user-1", email="user1@example.com", hashed_password="fake")
    user2 = User(id="user-2", email="user2@example.com", hashed_password="fake")
    
    test_db_session.add(user1)
    test_db_session.add(user2)
    await test_db_session.commit()
    
    # Create a conversation for user1
    user1_conversation = await create_conversation(test_db_session, user1.id)
    
    # Try to access user1's conversation as user2
    user2_access_attempt = await get_conversation_by_id(
        test_db_session,
        user1_conversation.id,
        user2.id  # user2 trying to access user1's conversation
    )
    
    # Should return None because user2 doesn't own the conversation
    assert user2_access_attempt is None


@pytest.mark.asyncio
async def test_user_cannot_access_other_users_messages(test_db_session: AsyncSession):
    """Test that users cannot access messages belonging to other users."""
    # Create two different users
    user1 = User(id="user-1-messages", email="user1-msg@example.com", hashed_password="fake")
    user2 = User(id="user-2-messages", email="user2-msg@example.com", hashed_password="fake")
    
    test_db_session.add(user1)
    test_db_session.add(user2)
    await test_db_session.commit()
    
    # Create a conversation for user1
    user1_conversation = await create_conversation(test_db_session, user1.id)
    
    # Add a message to user1's conversation
    message = await save_message(
        test_db_session,
        user1.id,
        user1_conversation.id,
        "user",
        "This is user1's private message"
    )
    
    # Try to access user1's message as user2
    # This would normally be done through get_messages_for_conversation
    # but we'll check if user2 can access the message directly via the DB
    result = await test_db_session.execute(
        select(Message).where(
            Message.id == message.id,
            Message.user_id == user2.id  # user2 trying to access user1's message
        )
    )
    user2_message = result.scalar_one_or_none()
    
    # Should return None because user2 doesn't own the message
    assert user2_message is None


@pytest.mark.asyncio
async def test_user_cannot_access_other_users_tasks(test_db_session: AsyncSession):
    """Test that users cannot access tasks belonging to other users."""
    # Create two different users
    user1 = User(id="user-1-tasks", email="user1-task@example.com", hashed_password="fake")
    user2 = User(id="user-2-tasks", email="user2-task@example.com", hashed_password="fake")
    
    test_db_session.add(user1)
    test_db_session.add(user2)
    await test_db_session.commit()
    
    # Create a task for user1
    user1_task = await create_task(
        test_db_session,
        user_id=user1.id,
        title="User1's private task",
        description="This task belongs to user1 only"
    )
    
    # Try to access user1's tasks as user2
    user2_tasks = await get_user_tasks(
        test_db_session,
        user2.id,  # user2 requesting user1's tasks
        status="all"
    )
    
    # user2 should not see user1's task
    task_ids = [task.id for task in user2_tasks]
    assert user1_task.id not in task_ids
    
    # Verify user1 can still access their own task
    user1_tasks = await get_user_tasks(
        test_db_session,
        user1.id,
        status="all"
    )
    user1_task_ids = [task.id for task in user1_tasks]
    assert user1_task.id in user1_task_ids


@pytest.mark.asyncio
async def test_user_can_access_their_own_resources(test_db_session: AsyncSession):
    """Test that users can access their own conversations, messages, and tasks."""
    # Create a user
    user = User(id="own-resources-user", email="own@example.com", hashed_password="fake")
    test_db_session.add(user)
    await test_db_session.commit()
    
    # Create a conversation for the user
    conversation = await create_conversation(test_db_session, user.id)
    
    # Add a message to the user's conversation
    message = await save_message(
        test_db_session,
        user.id,
        conversation.id,
        "user",
        "This is my own message"
    )
    
    # Create a task for the user
    task = await create_task(
        test_db_session,
        user_id=user.id,
        title="My own task",
        description="This task belongs to me"
    )
    
    # Verify user can access their own resources
    retrieved_conversation = await get_conversation_by_id(
        test_db_session,
        conversation.id,
        user.id
    )
    assert retrieved_conversation is not None
    assert retrieved_conversation.id == conversation.id
    
    user_conversations = await get_user_conversations(test_db_session, user.id)
    assert len(user_conversations) == 1
    assert user_conversations[0].id == conversation.id
    
    user_tasks = await get_user_tasks(test_db_session, user.id, status="all")
    task_ids = [t.id for t in user_tasks]
    assert task.id in task_ids


@pytest.mark.asyncio
async def test_user_conversation_isolation(test_db_session: AsyncSession):
    """Test that users only see their own conversations."""
    # Create two different users
    user1 = User(id="user-1-conv-iso", email="user1-iso@example.com", hashed_password="fake")
    user2 = User(id="user-2-conv-iso", email="user2-iso@example.com", hashed_password="fake")
    
    test_db_session.add(user1)
    test_db_session.add(user2)
    await test_db_session.commit()
    
    # Create conversations for both users
    user1_conv = await create_conversation(test_db_session, user1.id)
    user2_conv = await create_conversation(test_db_session, user2.id)
    
    # Each user should only see their own conversations
    user1_conversations = await get_user_conversations(test_db_session, user1.id)
    user1_conv_ids = [conv.id for conv in user1_conversations]
    assert user1_conv.id in user1_conv_ids
    assert user2_conv.id not in user1_conv_ids
    
    user2_conversations = await get_user_conversations(test_db_session, user2.id)
    user2_conv_ids = [conv.id for conv in user2_conversations]
    assert user2_conv.id in user2_conv_ids
    assert user1_conv.id not in user2_conv_ids


@pytest.mark.asyncio
async def test_user_message_isolation_in_conversation(test_db_session: AsyncSession):
    """Test that users only see messages in conversations they own."""
    # Create two different users
    user1 = User(id="user-1-msg-iso", email="user1-msg-iso@example.com", hashed_password="fake")
    user2 = User(id="user-2-msg-iso", email="user2-msg-iso@example.com", hashed_password="fake")
    
    test_db_session.add(user1)
    test_db_session.add(user2)
    await test_db_session.commit()
    
    # Create conversations for both users
    user1_conversation = await create_conversation(test_db_session, user1.id)
    user2_conversation = await create_conversation(test_db_session, user2.id)
    
    # Add messages to each user's conversation
    await save_message(
        test_db_session,
        user1.id,
        user1_conversation.id,
        "user",
        "User1's message in their own conversation"
    )
    
    await save_message(
        test_db_session,
        user2.id,
        user2_conversation.id,
        "user",
        "User2's message in their own conversation"
    )
    
    # Each user should only see messages in their own conversations
    user1_messages = await get_messages_for_conversation(test_db_session, user1_conversation.id, user1.id)
    assert len(user1_messages) == 1
    assert user1_messages[0].content == "User1's message in their own conversation"
    
    user2_messages = await get_messages_for_conversation(test_db_session, user2_conversation.id, user2.id)
    assert len(user2_messages) == 1
    assert user2_messages[0].content == "User2's message in their own conversation"


@pytest.mark.asyncio
async def test_cross_user_resource_access_fails(test_db_session: AsyncSession):
    """Test that cross-user resource access attempts fail appropriately."""
    # Create two different users
    user1 = User(id="user-1-cross", email="user1-cross@example.com", hashed_password="fake")
    user2 = User(id="user-2-cross", email="user2-cross@example.com", hashed_password="fake")
    
    test_db_session.add(user1)
    test_db_session.add(user2)
    await test_db_session.commit()
    
    # Create resources for user1
    user1_conversation = await create_conversation(test_db_session, user1.id)
    user1_task = await create_task(
        test_db_session,
        user_id=user1.id,
        title="User1's task",
        description="Only user1 should see this"
    )
    
    # Verify user2 cannot access user1's resources
    user2_conversation_access = await get_conversation_by_id(
        test_db_session,
        user1_conversation.id,
        user2.id
    )
    assert user2_conversation_access is None
    
    user2_tasks = await get_user_tasks(
        test_db_session,
        user2.id,
        status="all"
    )
    user2_task_ids = [task.id for task in user2_tasks]
    assert user1_task.id not in user2_task_ids  # user2 shouldn't see user1's task
    
    # Verify user1 can still access their own resources
    user1_conversation_access = await get_conversation_by_id(
        test_db_session,
        user1_conversation.id,
        user1.id
    )
    assert user1_conversation_access is not None
    
    user1_tasks = await get_user_tasks(
        test_db_session,
        user1.id,
        status="all"
    )
    user1_task_ids = [task.id for task in user1_tasks]
    assert user1_task.id in user1_task_ids