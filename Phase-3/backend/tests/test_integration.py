"""Integration tests for the complete AI Todo Chatbot system."""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.user import User
from src.models.task import Task
from src.models.conversation import Conversation
from src.models.message import Message
from src.db import get_session
from unittest.mock import AsyncMock, patch
import json


@pytest.mark.asyncio
async def test_complete_chat_flow_integration(async_client: AsyncClient, sample_user: User, test_db_session: AsyncSession):
    """Test the complete flow: user sends message -> AI processes -> tools called -> response returned."""
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        # Mock the authenticated user
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        # Mock the AI agent to simulate adding a task
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.return_value = {
                "response": "I've added the task 'Buy groceries' for you.",
                "tool_calls": [{
                    "name": "add_task",
                    "arguments": {"user_id": sample_user.id, "title": "Buy groceries", "description": "Milk and eggs"},
                    "result": {"task_id": 1, "status": "created", "title": "Buy groceries"}
                }]
            }
            
            # Send a message to the chat endpoint
            response = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={"message": "Add a task to buy groceries"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            # Verify the response
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert "response" in data["data"]
            assert "conversation_id" in data["data"]
            assert "tool_calls" in data["data"]
            
            # Verify the response content
            assert "Buy groceries" in data["data"]["response"]
            
            # Verify tool was called
            assert len(data["data"]["tool_calls"]) == 1
            assert data["data"]["tool_calls"][0]["name"] == "add_task"
            assert data["data"]["tool_calls"][0]["result"]["status"] == "created"
            
            # Verify the task was actually saved to the database
            result = await test_db_session.execute(
                select(Task).where(Task.title == "Buy groceries")
            )
            saved_task = result.scalar_one_or_none()
            assert saved_task is not None
            assert saved_task.user_id == sample_user.id
            assert saved_task.title == "Buy groceries"
            assert saved_task.description == "Milk and eggs"


@pytest.mark.asyncio
async def test_conversation_history_preserved(async_client: AsyncClient, sample_user: User, test_db_session: AsyncSession):
    """Test that conversation history is preserved between requests."""
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        # First message - add a task
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.return_value = {
                "response": "I've added the task 'Buy groceries'.",
                "tool_calls": [{
                    "name": "add_task",
                    "arguments": {"user_id": sample_user.id, "title": "Buy groceries"},
                    "result": {"task_id": 1, "status": "created", "title": "Buy groceries"}
                }]
            }
            
            response1 = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={"message": "Add a task to buy groceries"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response1.status_code == 200
            conversation_id = response1.json()["data"]["conversation_id"]
            
            # Second message in same conversation - ask about tasks
            mock_agent.return_value = {
                "response": "You have 1 task: Buy groceries.",
                "tool_calls": [{
                    "name": "list_tasks",
                    "arguments": {"user_id": sample_user.id, "status": "all"},
                    "result": [{"id": 1, "title": "Buy groceries", "completed": False}]
                }]
            }
            
            response2 = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={
                    "message": "What tasks do I have?",
                    "conversation_id": conversation_id
                },
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response2.status_code == 200
            data2 = response2.json()
            assert "Buy groceries" in data2["data"]["response"]
            
            # Verify both messages are in the database
            result = await test_db_session.execute(
                select(Message).where(Message.conversation_id == conversation_id)
            )
            messages = result.scalars().all()
            assert len(messages) == 4  # 2 user messages + 2 assistant responses


@pytest.mark.asyncio
async def test_multiple_users_isolation(async_client: AsyncClient, test_db_session: AsyncSession):
    """Test that multiple users are properly isolated."""
    # Create two users
    user1 = User(id="integration-test-user-1", email="user1@test.com", hashed_password="fake")
    user2 = User(id="integration-test-user-2", email="user2@test.com", hashed_password="fake")
    
    test_db_session.add(user1)
    test_db_session.add(user2)
    await test_db_session.commit()
    
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        # Test user 1
        mock_verify.return_value = type('MockUser', (), {'user_id': user1.id})()
        
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.return_value = {
                "response": "I've added your task.",
                "tool_calls": [{
                    "name": "add_task",
                    "arguments": {"user_id": user1.id, "title": "User1 task"},
                    "result": {"task_id": 1, "status": "created", "title": "User1 task"}
                }]
            }
            
            response1 = await async_client.post(
                f"/api/{user1.id}/chat",
                json={"message": "Add a task for user 1"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response1.status_code == 200
        
        # Test user 2
        mock_verify.return_value = type('MockUser', (), {'user_id': user2.id})()
        
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent2:
            mock_agent2.return_value = {
                "response": "I've added your task.",
                "tool_calls": [{
                    "name": "add_task",
                    "arguments": {"user_id": user2.id, "title": "User2 task"},
                    "result": {"task_id": 2, "status": "created", "title": "User2 task"}
                }]
            }
            
            response2 = await async_client.post(
                f"/api/{user2.id}/chat",
                json={"message": "Add a task for user 2"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response2.status_code == 200
        
        # Verify users have their own tasks
        result1 = await test_db_session.execute(
            select(Task).where(Task.user_id == user1.id)
        )
        user1_tasks = result1.scalars().all()
        
        result2 = await test_db_session.execute(
            select(Task).where(Task.user_id == user2.id)
        )
        user2_tasks = result2.scalars().all()
        
        # Each user should only see their own tasks
        assert len(user1_tasks) == 1
        assert user1_tasks[0].title == "User1 task"
        
        assert len(user2_tasks) == 1
        assert user2_tasks[0].title == "User2 task"
        
        # Verify no cross-contamination
        user1_task_titles = [task.title for task in user1_tasks]
        user2_task_titles = [task.title for task in user2_tasks]
        assert "User2 task" not in user1_task_titles
        assert "User1 task" not in user2_task_titles


@pytest.mark.asyncio
async def test_task_completion_flow(async_client: AsyncClient, sample_user: User, test_db_session: AsyncSession):
    """Test the complete flow for completing a task."""
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        # First, add a task
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.return_value = {
                "response": "I've added the task 'Complete this task'.",
                "tool_calls": [{
                    "name": "add_task",
                    "arguments": {"user_id": sample_user.id, "title": "Complete this task"},
                    "result": {"task_id": 1, "status": "created", "title": "Complete this task"}
                }]
            }
            
            response1 = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={"message": "Add a task to complete this task"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response1.status_code == 200
            
            # Verify task was created and is not completed
            result = await test_db_session.execute(
                select(Task).where(Task.title == "Complete this task")
            )
            task = result.scalar_one_or_none()
            assert task is not None
            assert task.completed is False
            
            # Now complete the task
            mock_agent.return_value = {
                "response": "I've marked the task as complete.",
                "tool_calls": [{
                    "name": "complete_task",
                    "arguments": {"user_id": sample_user.id, "task_id": task.id},
                    "result": {"task_id": task.id, "status": "completed", "title": "Complete this task"}
                }]
            }
            
            response2 = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={"message": f"Mark task {task.id} as complete"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response2.status_code == 200
            
            # Verify task is now completed in the database
            await test_db_session.refresh(task)
            assert task.completed is True


@pytest.mark.asyncio
async def test_error_handling_integration(async_client: AsyncClient, sample_user: User):
    """Test that errors are handled gracefully in the integration."""
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        # Mock the AI agent to raise an error
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.side_effect = Exception("AI service unavailable")
            
            response = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={"message": "Test message"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            # Should return a graceful error response, not crash
            assert response.status_code == 200  # The endpoint should handle the exception
            data = response.json()
            assert "data" in data
            assert "response" in data["data"]
            # The agent should return an error message
            assert "error" in data["data"]["response"].lower() or "encountered" in data["data"]["response"].lower()