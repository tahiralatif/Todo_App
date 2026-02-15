"""Task service for CRUD operations with user isolation."""

import logging
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import Task

# Configure logger for US2 operations
logger = logging.getLogger(__name__)


async def create_task(
    session: AsyncSession,
    user_id: str,
    title: str,
    description: str | None = None,
    priority: str = "MEDIUM",
    due_date: datetime | None = None,
) -> Task:
    """
    Create a new task linked to the specified user.

    Args:
        session: Async database session
        user_id: Owning user's UUID (from JWT sub claim)
        title: Task title (1-200 characters, validated by Pydantic schema)
        description: Optional task description (0-1000 characters)
        priority: Task priority (LOW, MEDIUM, HIGH)
        due_date: Optional due date and time for the task

    Returns:
        Created Task instance
    """
    # Remove timezone info if present (database uses TIMESTAMP WITHOUT TIME ZONE)
    if due_date is not None and hasattr(due_date, 'tzinfo') and due_date.tzinfo is not None:
        due_date = due_date.replace(tzinfo=None)
    
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        priority=priority,
        due_date=due_date,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


async def get_user_tasks(
    session: AsyncSession,
    user_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    include_deleted: bool = False,
) -> List[Task]:
    """
    Get tasks for a specific user with optional filtering.

    Args:
        session: Async database session
        user_id: Owning user's UUID (from JWT sub claim)
        status: Filter by status ("pending", "completed", "all", "deleted")
        priority: Filter by priority ("LOW", "MEDIUM", "HIGH")
        date_from: Filter tasks created after this date
        date_to: Filter tasks created before this date
        include_deleted: Whether to include soft-deleted tasks

    Returns:
        List of Task instances belonging to the user with applied filters
    """
    statement = select(Task).where(Task.user_id == user_id)

    # Apply filters based on status
    if status:
        if status.lower() == "pending":
            statement = statement.where(and_(Task.completed == False, Task.is_deleted == False))
        elif status.lower() == "completed":
            statement = statement.where(and_(Task.completed == True, Task.is_deleted == False))
        elif status.lower() == "deleted":
            statement = statement.where(Task.is_deleted == True)
        elif status.lower() == "all":
            if not include_deleted:
                statement = statement.where(Task.is_deleted == False)
        else:
            # Default behavior - exclude deleted tasks
            if not include_deleted:
                statement = statement.where(Task.is_deleted == False)
    else:
        # Default behavior - exclude deleted tasks
        if not include_deleted:
            statement = statement.where(Task.is_deleted == False)

    # Apply priority filter
    if priority:
        statement = statement.where(Task.priority == priority)

    # Apply date filters
    if date_from:
        statement = statement.where(Task.created_at >= date_from)
    if date_to:
        statement = statement.where(Task.created_at <= date_to)

    statement = statement.order_by(Task.created_at.desc())  # Order by newest first

    result = await session.execute(statement)
    return list(result.scalars().all())


async def get_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
    include_deleted: bool = False,
) -> Task | None:
    """
    Get a single task by ID, ensuring ownership.

    Args:
        session: Async database session
        task_id: Task ID to retrieve
        user_id: Owning user's UUID (from JWT sub claim)
        include_deleted: Whether to include soft-deleted tasks

    Returns:
        Task if found and owned by user, None otherwise
    """
    # Validate task_id is positive to prevent negative ID issues
    if task_id <= 0:
        return None

    if include_deleted:
        statement = select(Task).where((Task.id == task_id) & (Task.user_id == user_id))
    else:
        statement = select(Task).where((Task.id == task_id) & (Task.user_id == user_id) & (Task.is_deleted == False))

    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def update_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
    title: str | None = None,
    description: str | None = None,
    completed: bool | None = None,
    priority: str | None = None,
    due_date: datetime | None = None,
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
        priority: New priority (optional, LOW/MEDIUM/HIGH)
        due_date: New due date (optional)

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

    if priority is not None:
        task.priority = priority

    if due_date is not None:
        # Remove timezone info if present (database uses TIMESTAMP WITHOUT TIME ZONE)
        if hasattr(due_date, 'tzinfo') and due_date.tzinfo is not None:
            task.due_date = due_date.replace(tzinfo=None)
        else:
            task.due_date = due_date

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
    permanent: bool = False,  # If True, performs hard delete
) -> bool:
    """
    Delete a task, ensuring ownership.

    Args:
        session: Async database session
        task_id: Task ID to delete
        user_id: Owning user's UUID
        permanent: If True, performs hard delete; if False, performs soft delete

    Returns:
        True if task was deleted, False if not found
    """
    # Validate task_id is positive
    if task_id <= 0:
        return False

    task = await get_task(session, task_id, user_id, include_deleted=True)
    if task is None:
        return False

    if permanent:
        # Hard delete - remove completely from database
        # Log the deletion operation before deletion
        logger.info(
            f"Task permanently deleted: task_id={task_id}, user_id={user_id}, " f"title='{task.title}'"
        )

        # Explicitly delete related notifications first to handle databases without cascade support
        from sqlalchemy import delete
        from src.models.user import Notification

        await session.execute(delete(Notification).where(Notification.task_id == task_id))

        await session.delete(task)
        await session.commit()
        return True
    else:
        # Soft delete - mark as deleted but keep in database
        task.is_deleted = True
        task.deleted_at = datetime.now()
        task.updated_at = datetime.now()

        # Log the soft deletion operation
        logger.info(
            f"Task soft deleted: task_id={task_id}, user_id={user_id}, " f"title='{task.title}'"
        )

        await session.commit()
        await session.refresh(task)
        return True


async def restore_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
) -> bool:
    """
    Restore a soft-deleted task.

    Args:
        session: Async database session
        task_id: Task ID to restore
        user_id: Owning user's UUID

    Returns:
        True if task was restored, False if not found or not deleted
    """
    # Validate task_id is positive
    if task_id <= 0:
        return False

    # Get the task including soft-deleted ones
    task = await get_task(session, task_id, user_id, include_deleted=True)
    if task is None or not task.is_deleted:
        return False

    # Restore the task
    task.is_deleted = False
    task.deleted_at = None
    task.updated_at = datetime.now()

    logger.info(
        f"Task restored: task_id={task_id}, user_id={user_id}, " f"title='{task.title}'"
    )

    await session.commit()
    await session.refresh(task)
    return True
