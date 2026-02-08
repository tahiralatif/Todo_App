"""Tests for the AI chatbot endpoint."""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.user import User
from src.models.conversation import Conversation
from src.models.message import Message
from src.db import get_session
from unittest.mock import AsyncMock, patch
import json


@pytest.mark.asyncio
async def test_chat_endpoint_requires_authentication(async_client: AsyncClient):
    """Test that chat endpoint requires authentication."""
    response = await async_client.post("/api/test-user-id/chat", json={"message": "Hello"})
    assert response.status_code == 401  # Unauthorized


@pytest.mark.asyncio
async def test_chat_endpoint_valid_request(async_client: AsyncClient, sample_user: User):
    """Test that chat endpoint processes valid requests."""
    # Create a mock JWT token for testing
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        # Mock the AI agent response
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.return_value = {
                "response": "I've added your task.",
                "tool_calls": []
            }
            
            response = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={"message": "Add a task to buy groceries"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert "response" in data["data"]
            assert data["data"]["response"] == "I've added your task."


@pytest.mark.asyncio
async def test_chat_endpoint_creates_conversation(async_client: AsyncClient, sample_user: User):
    """Test that chat endpoint creates a new conversation when none is provided."""
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.return_value = {
                "response": "Hello! How can I help?",
                "tool_calls": []
            }
            
            response = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={"message": "Hi there!"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "conversation_id" in data["data"]


@pytest.mark.asyncio
async def test_chat_endpoint_with_existing_conversation(async_client: AsyncClient, sample_user: User):
    """Test that chat endpoint works with an existing conversation."""
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.return_value = {
                "response": "I've processed your request.",
                "tool_calls": []
            }
            
            response = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={
                    "message": "Update my task",
                    "conversation_id": 1
                },
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["data"]["response"] == "I've processed your request."


@pytest.mark.asyncio
async def test_chat_endpoint_message_saved_to_db(async_client: AsyncClient, sample_user: User, test_db_session: AsyncSession):
    """Test that user messages are saved to the database."""
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        with patch('src.agents.todo_agent.get_todo_agent_response') as mock_agent:
            mock_agent.return_value = {
                "response": "Got your message.",
                "tool_calls": []
            }
            
            response = await async_client.post(
                f"/api/{sample_user.id}/chat",
                json={"message": "Test message for DB"},
                headers={"Authorization": "Bearer fake-token"}
            )
            
            assert response.status_code == 200
            
            # Check that the message was saved to the database
            result = await test_db_session.execute(
                select(Message).where(Message.content == "Test message for DB")
            )
            message = result.scalar_one_or_none()
            assert message is not None
            assert message.user_id == sample_user.id
            assert message.role == "user"


@pytest.mark.asyncio
async def test_chat_endpoint_user_isolation(async_client: AsyncClient, sample_user: User):
    """Test that users can't access other users' conversations."""
    other_user_id = "different-user-id"
    
    with patch('src.middleware.auth.verify_jwt_token') as mock_verify:
        # Mock the authenticated user as sample_user
        mock_verify.return_value = type('MockUser', (), {'user_id': sample_user.id})()
        
        response = await async_client.post(
            f"/api/{other_user_id}/chat",  # Trying to access different user's chat
            json={"message": "Trying to access another user's chat"},
            headers={"Authorization": "Bearer fake-token"}
        )
        
        # Should return 403 Forbidden because path user_id doesn't match authenticated user
        assert response.status_code == 403