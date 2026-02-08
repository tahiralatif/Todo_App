"""Chat routes for AI-powered todo management."""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.middleware.auth import require_user
from src.services.conversation_service import (
    create_conversation,
    get_conversation_history,
)
from src.services.message_service import (
    save_message,
    save_assistant_message
)
from src.agents.todo_agent import get_todo_agent_response

router = APIRouter(prefix="/api/{user_id}", tags=["chat"])


@router.post("/chat", response_model=Dict[str, Any])
async def chat_with_agent(
    user_id: str = Path(..., description="User ID from JWT token"),
    request: Dict[str, Any] = None,
    current_user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> Dict[str, Any]:
    """
    Chat with the AI agent to manage tasks through natural language.
    
    The agent will interpret natural language and use MCP tools to manage tasks.
    Conversation history is preserved in the database.
    """
    if request is None:
        request = {}
        
    message = request.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Verify that the user_id in the path matches the authenticated user
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot access another user's chat")
    
    # Get or create conversation
    conversation_id = request.get("conversation_id")
    if not conversation_id:
        # Create a new conversation
        conversation = await create_conversation(session, user_id)
        conversation_id = conversation.id
    else:
        # Verify that the conversation belongs to the user
        from sqlalchemy import select
        from src.models.conversation import Conversation
        stmt = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        result = await session.execute(stmt)
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Save user message to database
    await save_message(
        session=session,
        user_id=user_id,
        conversation_id=conversation_id,
        role="user",
        content=message
    )
    
    # Get conversation history for context
    conversation_history = await get_conversation_history(session, conversation_id)
    
    # Get response from AI agent with MCP tools
    agent_response = await get_todo_agent_response(
        user_id=user_id,
        message=message,
        conversation_history=conversation_history
    )
    
    # Save assistant response to database
    await save_assistant_message(
        session=session,
        user_id=user_id,
        conversation_id=conversation_id,
        content=agent_response.get("response", ""),
        tool_calls=agent_response.get("tool_calls", [])
    )
    
    # Return response with conversation ID and tool calls
    return {
        "success": True,
        "data": {
            "conversation_id": conversation_id,
            "response": agent_response.get("response", ""),
            "tool_calls": agent_response.get("tool_calls", [])
        },
        "message": "Message processed successfully"
    }