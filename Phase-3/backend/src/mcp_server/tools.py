"""MCP tools for task operations."""

import asyncio
from typing import Dict, Any, List, Optional
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session_context
from src.models.task import Task
from src.services.task_service import (
    create_task,
    get_user_tasks,
    update_task,
    delete_task,
    toggle_complete
)


async def initialize_mcp_server():
    """Initialize the MCP server."""
    print("MCP server initialization placeholder")
    # In a real implementation, this would start the MCP server
    # For now, we're just preparing the tools that would be exposed via MCP
    pass


async def add_task_tool(user_id: str, title: str, description: Optional[str] = None) -> Dict[str, Any]:
    """MCP tool to add a new task."""
    async with get_session_context() as session:
        task = await create_task(
            session=session,
            user_id=user_id,
            title=title,
            description=description
        )
        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title
        }


async def list_tasks_tool(user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """MCP tool to list tasks."""
    async with get_session_context() as session:
        tasks = await get_user_tasks(
            session=session,
            user_id=user_id,
            status=status
        )
        return [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed
            }
            for task in tasks
        ]


async def complete_task_tool(user_id: str, task_id: int) -> Dict[str, Any]:
    """MCP tool to mark a task as complete."""
    async with get_session_context() as session:
        task = await toggle_complete(
            session=session,
            task_id=task_id,
            user_id=user_id,
            completed=True
        )
        if task is None:
            return {
                "task_id": task_id,
                "status": "not_found",
                "title": "Unknown"
            }
        return {
            "task_id": task.id,
            "status": "completed",
            "title": task.title
        }


async def delete_task_tool(user_id: str, task_id: int) -> Dict[str, Any]:
    """MCP tool to delete a task."""
    async with get_session_context() as session:
        success = await delete_task(
            session=session,
            task_id=task_id,
            user_id=user_id,
            permanent=True
        )
        if not success:
            return {
                "task_id": task_id,
                "status": "not_found",
                "title": "Unknown"
            }
        
        # Get the task to return its title
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(statement)
        task = result.scalar_one_or_none()
        
        return {
            "task_id": task_id,
            "status": "deleted",
            "title": task.title if task else "Unknown"
        }


async def update_task_tool(
    user_id: str, 
    task_id: int, 
    title: Optional[str] = None, 
    description: Optional[str] = None
) -> Dict[str, Any]:
    """MCP tool to update a task."""
    async with get_session_context() as session:
        # Get the existing task to preserve unchanged fields
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.execute(statement)
        existing_task = result.scalar_one_or_none()
        
        if not existing_task:
            return {
                "task_id": task_id,
                "status": "not_found",
                "title": "Unknown"
            }
        
        # Use existing values if not provided
        new_title = title if title is not None else existing_task.title
        new_description = description if description is not None else existing_task.description
        
        updated_task = await update_task(
            session=session,
            task_id=task_id,
            user_id=user_id,
            title=new_title,
            description=new_description,
            completed=existing_task.completed  # Preserve completion status
        )
        
        if updated_task is None:
            return {
                "task_id": task_id,
                "status": "not_found",
                "title": "Unknown"
            }
        
        return {
            "task_id": updated_task.id,
            "status": "updated",
            "title": updated_task.title
        }


# Dictionary of available tools
MCP_TOOLS = {
    "add_task": add_task_tool,
    "list_tasks": list_tasks_tool,
    "complete_task": complete_task_tool,
    "delete_task": delete_task_tool,
    "update_task": update_task_tool
}