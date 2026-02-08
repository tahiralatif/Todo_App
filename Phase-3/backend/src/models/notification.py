from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User
    from .task import Task


class NotificationType(str, Enum):
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
    type: NotificationType = Field(sa_column_kwargs={"nullable": False})
    title: str = Field(max_length=200)
    message: str = Field(max_length=1000)
    is_read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.now)

    # Relationships
    user: "User" = Relationship(back_populates="notifications")
    task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")  # Optional task association
    task: Optional["Task"] = Relationship(back_populates="notifications")