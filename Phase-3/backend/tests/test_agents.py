"""Tests for the AI agent functionality."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from src.agents.todo_agent import get_todo_agent_response
from src.mcp_server.tools import MCP_TOOLS
import json


@pytest.mark.asyncio
async def test_agent_response_format():
    """Test that agent returns properly formatted response."""
    user_id = "test-user-123"
    message = "Add a task to buy groceries"
    conversation_history = []
    
    # Mock the agents library components
    with patch('src.agents.todo_agent.AsyncOpenAI') as mock_async_openai, \
         patch('src.agents.todo_agent.OpenAIChatCompletionsModel') as mock_model, \
         patch('src.agents.todo_agent.Runner') as mock_runner, \
         patch('src.agents.todo_agent.Agent') as mock_agent_class, \
         patch('src.agents.todo_agent.RunConfig') as mock_run_config:
        
        # Mock the runner result
        mock_result = AsyncMock()
        mock_result.stream_events = AsyncMock(return_value=iter([]))
        mock_runner.run_streamed = AsyncMock(return_value=mock_result)
        
        # Mock the agent instance
        mock_agent_instance = AsyncMock()
        mock_agent_class.return_value = mock_agent_instance
        
        # Mock the stream events
        class MockEvent:
            def __init__(self, text):
                self.data = MagicMock()
                self.data.delta = text
        
        mock_events = [MockEvent("I'll help you add that task.")]
        mock_result.stream_events = AsyncMock(return_value=iter(mock_events))
        
        response = await get_todo_agent_response(user_id, message, conversation_history)
        
        assert "response" in response
        assert "tool_calls" in response
        assert isinstance(response["tool_calls"], list)


@pytest.mark.asyncio
async def test_agent_processes_add_task_action():
    """Test that agent can process add_task actions."""
    user_id = "test-user-123"
    message = "I need to add a task to buy groceries"
    conversation_history = []
    
    # Mock response that includes a task action
    mock_response_text = "I'll add that task for you. [TASK_ACTION:add_task:{\"title\": \"Buy groceries\", \"description\": \"Milk and eggs\"}]"
    
    with patch('src.agents.todo_agent.AsyncOpenAI'), \
         patch('src.agents.todo_agent.OpenAIChatCompletionsModel'), \
         patch('src.agents.todo_agent.RunConfig'), \
         patch('src.agents.todo_agent.Agent'), \
         patch('src.agents.todo_agent.Runner') as mock_runner:
        
        # Mock the runner result
        mock_result = AsyncMock()
        
        class MockEvent:
            def __init__(self, text):
                self.data = MagicMock()
                self.data.delta = text
        
        mock_events = [MockEvent(mock_response_text)]
        mock_result.stream_events = AsyncMock(return_value=iter(mock_events))
        mock_runner.run_streamed = AsyncMock(return_value=mock_result)
        
        # Mock the MCP tool
        with patch.dict(MCP_TOOLS, {"add_task": AsyncMock(return_value={"task_id": 1, "status": "created", "title": "Buy groceries"})}):
            response = await get_todo_agent_response(user_id, message, conversation_history)
            
            assert "response" in response
            assert "tool_calls" in response
            assert len(response["tool_calls"]) == 1
            assert response["tool_calls"][0]["name"] == "add_task"
            assert response["tool_calls"][0]["arguments"]["user_id"] == user_id
            assert response["tool_calls"][0]["arguments"]["title"] == "Buy groceries"


@pytest.mark.asyncio
async def test_agent_processes_list_tasks_action():
    """Test that agent can process list_tasks actions."""
    user_id = "test-user-123"
    message = "Show me my tasks"
    conversation_history = []
    
    # Mock response that includes a list action
    mock_response_text = "Here are your tasks. [TASK_ACTION:list_tasks:{\"status\": \"pending\"}]"
    
    with patch('src.agents.todo_agent.AsyncOpenAI'), \
         patch('src.agents.todo_agent.OpenAIChatCompletionsModel'), \
         patch('src.agents.todo_agent.RunConfig'), \
         patch('src.agents.todo_agent.Agent'), \
         patch('src.agents.todo_agent.Runner') as mock_runner:
        
        # Mock the runner result
        mock_result = AsyncMock()
        
        class MockEvent:
            def __init__(self, text):
                self.data = MagicMock()
                self.data.delta = text
        
        mock_events = [MockEvent(mock_response_text)]
        mock_result.stream_events = AsyncMock(return_value=iter(mock_events))
        mock_runner.run_streamed = AsyncMock(return_value=mock_result)
        
        # Mock the MCP tool
        mock_tasks = [{"id": 1, "title": "Buy groceries", "completed": False}]
        with patch.dict(MCP_TOOLS, {"list_tasks": AsyncMock(return_value=mock_tasks)}):
            response = await get_todo_agent_response(user_id, message, conversation_history)
            
            assert "response" in response
            assert "tool_calls" in response
            assert len(response["tool_calls"]) == 1
            assert response["tool_calls"][0]["name"] == "list_tasks"
            assert response["tool_calls"][0]["arguments"]["user_id"] == user_id
            assert response["tool_calls"][0]["arguments"]["status"] == "pending"


@pytest.mark.asyncio
async def test_agent_handles_multiple_actions():
    """Test that agent can process multiple actions in one response."""
    user_id = "test-user-123"
    message = "Add a task and then show my tasks"
    conversation_history = []
    
    # Mock response that includes multiple task actions
    mock_response_text = "Sure. [TASK_ACTION:add_task:{\"title\": \"New task\"}] Then [TASK_ACTION:list_tasks:{\"status\": \"all\"}]"
    
    with patch('src.agents.todo_agent.AsyncOpenAI'), \
         patch('src.agents.todo_agent.OpenAIChatCompletionsModel'), \
         patch('src.agents.todo_agent.RunConfig'), \
         patch('src.agents.todo_agent.Agent'), \
         patch('src.agents.todo_agent.Runner') as mock_runner:
        
        # Mock the runner result
        mock_result = AsyncMock()
        
        class MockEvent:
            def __init__(self, text):
                self.data = MagicMock()
                self.data.delta = text
        
        mock_events = [MockEvent(mock_response_text)]
        mock_result.stream_events = AsyncMock(return_value=iter(mock_events))
        mock_runner.run_streamed = AsyncMock(return_value=mock_result)
        
        # Mock the MCP tools
        with patch.dict(MCP_TOOLS, {
            "add_task": AsyncMock(return_value={"task_id": 1, "status": "created", "title": "New task"}),
            "list_tasks": AsyncMock(return_value=[{"id": 1, "title": "New task", "completed": False}])
        }):
            response = await get_todo_agent_response(user_id, message, conversation_history)
            
            assert "response" in response
            assert "tool_calls" in response
            assert len(response["tool_calls"]) == 2
            assert response["tool_calls"][0]["name"] == "add_task"
            assert response["tool_calls"][1]["name"] == "list_tasks"


@pytest.mark.asyncio
async def test_agent_handles_invalid_action():
    """Test that agent handles invalid action types gracefully."""
    user_id = "test-user-123"
    message = "Do something invalid"
    conversation_history = []
    
    # Mock response that includes an invalid action
    mock_response_text = "I'll try to do that. [TASK_ACTION:invalid_action:{\"param\": \"value\"}]"
    
    with patch('src.agents.todo_agent.AsyncOpenAI'), \
         patch('src.agents.todo_agent.OpenAIChatCompletionsModel'), \
         patch('src.agents.todo_agent.RunConfig'), \
         patch('src.agents.todo_agent.Agent'), \
         patch('src.agents.todo_agent.Runner') as mock_runner:
        
        # Mock the runner result
        mock_result = AsyncMock()
        
        class MockEvent:
            def __init__(self, text):
                self.data = MagicMock()
                self.data.delta = text
        
        mock_events = [MockEvent(mock_response_text)]
        mock_result.stream_events = AsyncMock(return_value=iter(mock_events))
        mock_runner.run_streamed = AsyncMock(return_value=mock_result)
        
        # Mock the MCP tools (without the invalid one)
        with patch.dict(MCP_TOOLS, {"add_task": AsyncMock(return_value={"task_id": 1, "status": "created", "title": "Test"})}):
            response = await get_todo_agent_response(user_id, message, conversation_history)
            
            # Should still return a response but with no tool calls for the invalid action
            assert "response" in response
            assert "tool_calls" in response


@pytest.mark.asyncio
async def test_agent_handles_malformed_json():
    """Test that agent handles malformed JSON in action parameters."""
    user_id = "test-user-123"
    message = "Do something with bad JSON"
    conversation_history = []
    
    # Mock response that includes malformed JSON
    mock_response_text = "Processing. [TASK_ACTION:add_task:{\"title\": \"Bad JSON\" \"missing_comma\": true}]"
    
    with patch('src.agents.todo_agent.AsyncOpenAI'), \
         patch('src.agents.todo_agent.OpenAIChatCompletionsModel'), \
         patch('src.agents.todo_agent.RunConfig'), \
         patch('src.agents.todo_agent.Agent'), \
         patch('src.agents.todo_agent.Runner') as mock_runner:
        
        # Mock the runner result
        mock_result = AsyncMock()
        
        class MockEvent:
            def __init__(self, text):
                self.data = MagicMock()
                self.data.delta = text
        
        mock_events = [MockEvent(mock_response_text)]
        mock_result.stream_events = AsyncMock(return_value=iter(mock_events))
        mock_runner.run_streamed = AsyncMock(return_value=mock_result)
        
        # Mock the MCP tools
        with patch.dict(MCP_TOOLS, {"add_task": AsyncMock(return_value={"task_id": 1, "status": "created", "title": "Test"})}):
            response = await get_todo_agent_response(user_id, message, conversation_history)
            
            # Should handle the malformed JSON gracefully
            assert "response" in response
            assert "tool_calls" in response