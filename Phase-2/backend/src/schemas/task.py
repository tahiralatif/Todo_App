"""Pydantic schemas for task endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


TaskPriority = Literal["LOW", "MEDIUM", "HIGH"]


class TaskCreate(BaseModel):
    """Request body for creating a new task."""

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (required, 1-200 characters)",
    )
    description: str | None = Field(
        default=None,
        max_length=1000,
        description="Task description (optional, 0-1000 characters)",
    )
    priority: TaskPriority = Field(
        default="MEDIUM",
        description="Task priority: LOW, MEDIUM, or HIGH (default: MEDIUM)",
    )
    due_date: datetime | None = Field(
        default=None,
        description="Task due date and time (optional, ISO 8601 format)",
    )


class TaskResponse(BaseModel):
    """Response model for task data."""

    id: int = Field(..., description="Task ID (auto-increment)")
    user_id: str = Field(..., description="Owning user UUID")
    title: str = Field(..., description="Task title")
    description: str | None = Field(default=None, description="Task description")
    completed: bool = Field(default=False, description="Completion status")
    priority: TaskPriority = Field(default="MEDIUM", description="Task priority")
    due_date: datetime | None = Field(default=None, description="Task due date and time")
    is_deleted: bool = Field(default=False, description="Whether the task is soft-deleted")
    deleted_at: datetime | None = Field(default=None, description="When the task was soft-deleted")
    created_at: datetime = Field(..., description="Task creation timestamp")
    updated_at: datetime = Field(..., description="Last modification timestamp")

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Response wrapper for list of tasks."""

    tasks: list[TaskResponse] = Field(..., description="List of user's tasks")
    count: int = Field(..., description="Total number of tasks")


class TaskUpdate(BaseModel):
    """Request body for full task update (PUT)."""

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (required, 1-200 characters)",
    )
    description: str | None = Field(
        default=None,
        max_length=1000,
        description="Task description (optional, 0-1000 characters)",
    )
    completed: bool = Field(default=False, description="Completion status")
    priority: TaskPriority = Field(
        default="MEDIUM",
        description="Task priority: LOW, MEDIUM, or HIGH",
    )
    due_date: datetime | None = Field(
        default=None,
        description="Task due date and time (optional)",
    )


class TaskPartialUpdate(BaseModel):
    """Request body for partial task update (PATCH)."""

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Task title (optional, 1-200 characters)",
    )
    description: str | None = Field(
        default=None,
        max_length=1000,
        description="Task description (optional, 0-1000 characters)",
    )
    completed: bool | None = Field(
        default=None, description="Completion status (optional)"
    )
    priority: TaskPriority | None = Field(
        default=None,
        description="Task priority: LOW, MEDIUM, or HIGH (optional)",
    )
    due_date: datetime | None = Field(
        default=None,
        description="Task due date and time (optional)",
    )


class TaskComplete(BaseModel):
    """Request body for toggling task completion."""

    completed: bool = Field(..., description="New completion status")
