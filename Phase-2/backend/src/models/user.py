from datetime import datetime
from typing import List, Optional
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel, Column
from sqlalchemy import Enum as SQLEnum


class NotificationTypeEnum(str, Enum):
    """Notification type enumeration matching database ENUM."""
    TASK_CREATED = "TASK_CREATED"
    TASK_UPDATED = "TASK_UPDATED"
    TASK_DELETED = "TASK_DELETED"
    TASK_COMPLETED = "TASK_COMPLETED"
    TASK_PENDING = "TASK_PENDING"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    PROFILE_UPDATED = "PROFILE_UPDATED"
    SIGNUP = "SIGNUP"


class TaskPriorityEnum(str, Enum):
    """Task priority enumeration."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    name: str = Field(sa_column_kwargs={"nullable": False})
    email: str = Field(unique=True, index=True)
    hashed_password: str = Field(sa_column_kwargs={"nullable": False})
    
    # Profile fields
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    date_of_birth: Optional[datetime] = Field(default=None)
    gender: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None)
    city: Optional[str] = Field(default=None, max_length=100)
    country: Optional[str] = Field(default=None, max_length=100)
    profile_photo_url: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    tasks: List["Task"] = Relationship(back_populates="user")
    notifications: List["Notification"] = Relationship(back_populates="user")


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)
    priority: str = Field(
        default="MEDIUM",
        sa_column=Column(
            SQLEnum(
                TaskPriorityEnum,
                name="taskpriority",
                create_type=True,
                native_enum=True
            ),
            nullable=False
        )
    )
    due_date: Optional[datetime] = Field(default=None, index=True)
    is_deleted: bool = Field(default=False, index=True)
    deleted_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="tasks")
    notifications: List["Notification"] = Relationship(back_populates="task")


class NotificationType:
    TASK_CREATED = "TASK_CREATED"
    TASK_UPDATED = "TASK_UPDATED"
    TASK_DELETED = "TASK_DELETED"
    TASK_COMPLETED = "TASK_COMPLETED"
    TASK_PENDING = "TASK_PENDING"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    PROFILE_UPDATED = "PROFILE_UPDATED"
    SIGNUP = "SIGNUP"


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True, nullable=False)
    type: str = Field(
        sa_column=Column(
            SQLEnum(
                NotificationTypeEnum,
                name="notificationtype",
                create_type=False,  # Don't create, use existing ENUM
                native_enum=True
            ),
            nullable=False
        )
    )
    title: str = Field(max_length=200)
    message: str = Field(max_length=1000)
    is_read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")

    # Relationships
    user: Optional["User"] = Relationship(back_populates="notifications")
    task: Optional["Task"] = Relationship(back_populates="notifications")



class PushSubscription(SQLModel, table=True):
    """Push subscription model for browser push notifications."""
    __tablename__ = "push_subscriptions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True, nullable=False)
    endpoint: str = Field(max_length=500, nullable=False)
    p256dh: str = Field(max_length=200, nullable=False)  # Encryption key
    auth: str = Field(max_length=200, nullable=False)  # Auth secret
    created_at: datetime = Field(default_factory=datetime.now)
