"""Task service for CRUD operations with user isolation."""

import logging
from datetime import datetime
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.task import Task

# Configure logger for US2 operations
logger = logging.getLogger(__name__)


async def create_task(
    session: AsyncSession,
    user_id: str,
    title: str,
    description: str | None = None,
) -> Task:
    """
    Create a new task linked to the specified user.

    Args:
        session: Async database session
        user_id: Owning user's UUID (from JWT sub claim)
        title: Task title (1-200 characters, validated by Pydantic schema)
        description: Optional task description (0-1000 characters)

    Returns:
        Created Task instance
    """
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


async def get_user_tasks(
    session: AsyncSession,
    user_id: str,
) -> List[Task]:
    """
    Get all tasks for a specific user (scoped query by user_id).

    Per MVP spec: no filtering, sorting, or pagination applied.

    Args:
        session: Async database session
        user_id: Owning user's UUID (from JWT sub claim)

    Returns:
        List of Task instances belonging to the user
    """
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.execute(statement)
    return list(result.scalars().all())


async def get_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
) -> Task | None:
    """
    Get a single task by ID, ensuring ownership.

    Args:
        session: Async database session
        task_id: Task ID to retrieve
        user_id: Owning user's UUID (from JWT sub claim)

    Returns:
        Task if found and owned by user, None otherwise
    """
    # Validate task_id is positive to prevent negative ID issues
    if task_id <= 0:
        return None

    statement = select(Task).where((Task.id == task_id) & (Task.user_id == user_id))
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def update_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
    title: str | None = None,
    description: str | None = None,
    completed: bool | None = None,
) -> Task | None:
    """
    Update an existing task with validation.

    Args:
        session: Async database session
        task_id: Task ID to update
        user_id: Owning user's UUID
        title: New title (optional, validates 1-200 chars)
        description: New description (optional)
        completed: New completion status (optional)

    Returns:
        Updated Task if found and owned, None otherwise

    Raises:
        ValueError: If title validation fails
    """
    # Validate task_id is positive
    if task_id <= 0:
        return None

    task = await get_task(session, task_id, user_id)
    if task is None:
        return None

    # Track old values for logging
    old_title = task.title
    old_description = task.description
    old_completed = task.completed

    # Validate title if provided
    if title is not None:
        # Sanitize title to remove control characters
        title = title.strip()
        if len(title) < 1 or len(title) > 200:
            raise ValueError("Title must be between 1-200 characters")
        task.title = title

    if description is not None:
        # Sanitize description to remove excessive whitespace
        description = description.strip()
        if len(description) > 1000:
            raise ValueError("Description must not exceed 1000 characters")
        task.description = description

    if completed is not None:
        task.completed = completed

    task.updated_at = datetime.now()
    await session.commit()
    await session.refresh(task)

    # Log the update operation
    logger.info(
        f"Task updated: task_id={task_id}, user_id={user_id}, "
        f"title={old_title}->{task.title}, "
        f"completed={old_completed}->{task.completed}"
    )

    return task


async def toggle_complete(
    session: AsyncSession,
    task_id: int,
    user_id: str,
    completed: bool,
) -> Task | None:
    """
    Toggle task completion status.

    Args:
        session: Async database session
        task_id: Task ID to toggle
        user_id: Owning user's UUID
        completed: New completion status

    Returns:
        Updated Task if found and owned, None otherwise
    """
    # Validate task_id is positive
    if task_id <= 0:
        return None

    task = await get_task(session, task_id, user_id)
    if task is None:
        return None

    old_completed = task.completed
    task.completed = completed
    task.updated_at = datetime.now()

    await session.commit()
    await session.refresh(task)

    # Log completion toggle
    logger.info(
        f"Task completion toggled: task_id={task_id}, user_id={user_id}, "
        f"completed={old_completed}->{task.completed}"
    )

    return task


async def delete_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
) -> bool:
    """
    Delete a task, ensuring ownership.

    Args:
        session: Async database session
        task_id: Task ID to delete
        user_id: Owning user's UUID

    Returns:
        True if task was deleted, False if not found
    """
    # Validate task_id is positive
    if task_id <= 0:
        return False

    task = await get_task(session, task_id, user_id)
    if task is None:
        return False

    # Log the deletion operation before deletion
    logger.info(
        f"Task deleted: task_id={task_id}, user_id={user_id}, " f"title='{task.title}'"
    )

    await session.delete(task)
    await session.commit()
    return True
