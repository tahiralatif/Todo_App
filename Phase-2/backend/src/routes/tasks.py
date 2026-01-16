"""Task routes for CRUD endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
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


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> List[TaskResponse]:
    """
    List all tasks for the authenticated user.

    Returns only tasks owned by the authenticated user (user isolation).
    Per MVP: no filtering, sorting, or pagination.
    """
    tasks = await get_user_tasks(session, user.user_id)
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
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """
    Get a specific task by ID.

    Returns 403 if task belongs to another user.
    Returns 404 if task does not exist.
    """
    task = await get_task(session, task_id, user.user_id)

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
    user=Depends(require_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """
    Delete a specific task by ID.

    Returns 204 No Content on success.
    Returns 403 if task belongs to another user.
    Returns 404 if task does not exist.
    """
    success = await delete_task(
        session=session,
        task_id=task_id,
        user_id=user.user_id,
    )

    if not success:
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
