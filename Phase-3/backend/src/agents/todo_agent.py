"""AI Todo Agent using agents library with Gemini API."""

import re
from agents import Agent, OpenAIChatCompletionsModel, Runner, RunConfig, AsyncOpenAI
from src.mcp_server.tools import MCP_TOOLS
from src.config import settings
import asyncio
import json
from typing import Dict, Any, List


def initialize_todo_agent():
    """Initialize the Todo Agent with Gemini API."""
    print("AI Todo Agent initialized with Gemini API")


async def get_todo_agent_response(
    user_id: str,
    message: str,
    conversation_history: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Process user message and return AI response with tool calls."""
    
    try:
        # Setup API Client to connect to Gemini through OpenAI-compatible endpoint
        external_client = AsyncOpenAI(
            api_key=settings.gemini_api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        model = OpenAIChatCompletionsModel(
            model="gemini-2.0-flash",  # Using Gemini flash model
            openai_client=external_client
        )

        config = RunConfig(
            model=model,
            model_provider=external_client,
            tracing_disabled=True
        )

        # Define the task management agent
        task_management_agent = Agent(
            name="Task Management Agent",
            instructions=f"""
You are an AI assistant that helps user {user_id} manage their tasks using natural language.
When users ask to add, list, complete, delete, or update tasks, respond appropriately.
Available actions:
- add_task: Create a new task with title and optional description
- list_tasks: Show tasks with optional status filter (all, pending, completed)
- complete_task: Mark a task as completed by ID
- delete_task: Remove a task by ID
- update_task: Change task title or description by ID

Always confirm actions with the user in your response.
Current conversation history: {json.dumps(conversation_history[-5:]) if conversation_history else 'No previous conversation'}.

When you need to perform an action, please respond in the following format:
[TASK_ACTION:type:params]
Where type is one of: add_task, list_tasks, complete_task, delete_task, update_task
And params is a JSON object with the required parameters.
Example: [TASK_ACTION:add_task:{{"title": "Buy groceries", "description": "Milk and eggs"}}]
Example: [TASK_ACTION:list_tasks:{{"status": "pending"}}]
Example: [TASK_ACTION:complete_task:{{"task_id": 1}}]
"""
        )

        # Run the agent with the user's message
        result = await Runner.run_streamed(
            starting_agent=task_management_agent,
            input=message,
            run_config=config
        )

        # Collect the response
        response_text = ""
        tool_calls = []
        
        async for event in result.stream_events():
            if hasattr(event, 'data') and hasattr(event.data, 'delta'):
                response_text += event.data.delta

        # Parse the response for task action commands
        # Look for patterns like [TASK_ACTION:type:params]
        action_pattern = r'\[TASK_ACTION:(\w+):({.*?})\]'
        matches = re.findall(action_pattern, response_text)
        
        for match in matches:
            action_type, params_str = match
            try:
                params = json.loads(params_str)
                # Add user_id to the parameters
                params['user_id'] = user_id
                
                # Call the appropriate MCP tool
                if action_type in MCP_TOOLS:
                    tool_result = await MCP_TOOLS[action_type](**params)
                    
                    tool_calls.append({
                        "name": action_type,
                        "arguments": params,
                        "result": tool_result
                    })
                    
                    # Remove the action command from the response text
                    response_text = re.sub(rf'\[TASK_ACTION:{action_type}:{re.escape(params_str)}\]', '', response_text)
            except json.JSONDecodeError:
                print(f"Could not parse parameters: {params_str}")
            except Exception as e:
                print(f"Error calling tool {action_type}: {str(e)}")

        return {
            "response": response_text.strip() or "I've processed your request.",
            "tool_calls": tool_calls
        }
    
    except Exception as e:
        print(f"Error in AI agent: {str(e)}")
        return {
            "response": "Sorry, I encountered an error processing your request.",
            "tool_calls": []
        }