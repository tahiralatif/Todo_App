"""Task routes for CRUD endpoints."""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.middleware.auth import require_user
from src.middleware.errors import FORBIDDEN, RESOURCE_NOT_FOUND
from src.schemas.task import (
    TaskComplete,
    TaskCreate,
    TaskPartialUpdate,
    TaskResponse,
    TaskUpdate,
)
from src.services.task_service import (
    create_task,
    delete_task,
    get_task,
    get_user_tasks,
    toggle_complete,
    update_task,
)
from src.services.notification_service import NotificationService
from src.models.notification import NotificationType


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
    status: Optional[str] = Query(None, description="Filter by status: 'all', 'pending', 'completed', 'deleted'"),
    date_from: Optional[datetime] = Query(None, description="Filter tasks created after this date (ISO format)"),
    date_to: Optional[datetime] = Query(None, description="Filter tasks created before this date (ISO format)"),
    include_deleted: bool = Query(False, description="Include soft-deleted tasks in the results"),
) -> List[TaskResponse]:
    """
    List tasks for the authenticated user with optional filtering.

    Returns only tasks owned by the authenticated user (user isolation).
    Supports filtering by status, date range, and inclusion of deleted tasks.
    """
    print(f"DEBUG: Listing tasks for user: {user.user_id}")

    # Convert status to lowercase for comparison
    normalized_status = status.lower() if status else None

    tasks = await get_user_tasks(
        session=session,
        user_id=user.user_id,
        status=normalized_status,
        date_from=date_from,
        date_to=date_to,
        include_deleted=include_deleted
    )

    print(f"DEBUG: Found {len(tasks)} tasks for user {user.user_id}")
    return [
        TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
        for task in tasks
    ]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_single_task(
    task_id: int,
    include_deleted: bool = Query(False, description="Include soft-deleted tasks"),
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """
    Get a specific task by ID.

    Returns 403 if task belongs to another user.
    Returns 404 if task does not exist.
    """
    task = await get_task(session, task_id, user.user_id, include_deleted=include_deleted)

    if task is None:
        # Check if task exists but belongs to different user
        from sqlalchemy import select
        from src.models.task import Task

        existing = await session.execute(select(Task).where(Task.id == task_id))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=FORBIDDEN,
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_new_task(
    request: TaskCreate,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """
    Create a new task for the authenticated user.

    User_id is extracted from JWT token (never from request body).
    Returns 422 if title validation fails.
    """
    task = await create_task(
        session=session,
        user_id=user.user_id,
        title=request.title,
        description=request.description,
    )

    # Create notification for task creation
    await NotificationService.create_task_notification(
        session=session,
        user_id=user.user_id,
        task=task,
        notification_type=NotificationType.TASK_CREATED,
    )

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.put("/{task_id}", response_model=TaskResponse)
async def update_full_task(
    task_id: int,
    request: TaskUpdate,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """
    Full update (replace) of a task.

    All fields (title, description, completed) are required.
    Validates title length (1-200 chars).
    Returns 403 if task belongs to another user.
    Returns 404 if task does not exist.
    Returns 422 on validation failure.
    """
    task = await update_task(
        session=session,
        task_id=task_id,
        user_id=user.user_id,
        title=request.title,
        description=request.description,
        completed=request.completed,
    )

    if task is None:
        from sqlalchemy import select
        from src.models.task import Task

        existing = await session.execute(select(Task).where(Task.id == task_id))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=FORBIDDEN,
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )

    # Create notification for task update
    await NotificationService.create_task_notification(
        session=session,
        user_id=user.user_id,
        task=task,
        notification_type=NotificationType.TASK_UPDATED,
    )

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_partial_task(
    task_id: int,
    request: TaskPartialUpdate,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """
    Partial update of a task.

    Only provided fields are updated (optional fields).
    Validates title if provided (1-200 chars).
    Returns 403 if task belongs to another user.
    Returns 404 if task does not exist.
    Returns 422 on validation failure.
    """
    task = await update_task(
        session=session,
        task_id=task_id,
        user_id=user.user_id,
        title=request.title,
        description=request.description,
        completed=request.completed,
    )

    if task is None:
        from sqlalchemy import select
        from src.models.task import Task

        existing = await session.execute(select(Task).where(Task.id == task_id))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=FORBIDDEN,
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )

    # Create notification for task update
    await NotificationService.create_task_notification(
        session=session,
        user_id=user.user_id,
        task=task,
        notification_type=NotificationType.TASK_UPDATED,
    )

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_complete(
    task_id: int,
    request: TaskComplete,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """
    Toggle task completion status.

    Only updates the completed field.
    Returns 403 if task belongs to another user.
    Returns 404 if task does not exist.
    """
    task = await toggle_complete(
        session=session,
        task_id=task_id,
        user_id=user.user_id,
        completed=request.completed,
    )

    if task is None:
        from sqlalchemy import select
        from src.models.task import Task

        existing = await session.execute(select(Task).where(Task.id == task_id))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=FORBIDDEN,
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )

    # Create notification for task completion status change
    notification_type = (
        NotificationType.TASK_COMPLETED if request.completed 
        else NotificationType.TASK_PENDING
    )
    await NotificationService.create_task_notification(
        session=session,
        user_id=user.user_id,
        task=task,
        notification_type=notification_type,
    )

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_task(
    task_id: int,
    permanent: bool = Query(False, description="If True, permanently deletes the task; if False, soft deletes"),
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """
    Delete a specific task by ID.

    Returns 204 No Content on success.
    Returns 403 if task belongs to another user.
    Returns 404 if task does not exist.

    By default, performs soft delete (marks as deleted but keeps in database).
    Use permanent=true to permanently delete the task.
    """
    # Get task before deletion for notification (including soft-deleted ones)
    task = await get_task(session, task_id, user.user_id, include_deleted=True)

    if task is None:
        # Check if task exists but belongs to different user
        from sqlalchemy import select
        from src.models.task import Task

        existing = await session.execute(select(Task).where(Task.id == task_id))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=FORBIDDEN,
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )

    # Create notification before deletion
    await NotificationService.create_task_notification(
        session=session,
        user_id=user.user_id,
        task=task,
        notification_type=NotificationType.TASK_DELETED,
    )

    success = await delete_task(
        session=session,
        task_id=task_id,
        user_id=user.user_id,
        permanent=permanent,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )


@router.post("/{task_id}/restore", response_model=TaskResponse)
async def restore_deleted_task(
    task_id: int,
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """
    Restore a soft-deleted task.

    Returns the restored task on success.
    Returns 403 if task belongs to another user.
    Returns 404 if task does not exist or is not deleted.
    """
    # Get task to verify it exists and belongs to user (including soft-deleted ones)
    task = await get_task(session, task_id, user.user_id, include_deleted=True)

    if task is None:
        # Check if task exists but belongs to different user
        from sqlalchemy import select
        from src.models.task import Task

        existing = await session.execute(select(Task).where(Task.id == task_id))
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=FORBIDDEN,
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )

    # Check if task is actually deleted
    if not task.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task is not deleted and cannot be restored",
        )

    success = await restore_task(
        session=session,
        task_id=task_id,
        user_id=user.user_id,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )

    # Refresh task to get updated data
    refreshed_task = await get_task(session, task_id, user.user_id)
    if not refreshed_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=RESOURCE_NOT_FOUND,
        )

    # Create notification for restoration
    await NotificationService.create_task_notification(
        session=session,
        user_id=user.user_id,
        task=refreshed_task,
        notification_type=NotificationType.TASK_CREATED,  # Using CREATED for restoration
    )

    return TaskResponse(
        id=refreshed_task.id,
        user_id=refreshed_task.user_id,
        title=refreshed_task.title,
        description=refreshed_task.description,
        completed=refreshed_task.completed,
        created_at=refreshed_task.created_at,
        updated_at=refreshed_task.updated_at,
    )
