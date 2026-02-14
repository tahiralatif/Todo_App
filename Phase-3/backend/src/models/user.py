from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .task import Task
    from .notification import Notification


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    name: str = Field(sa_column_kwargs={"nullable": False})
    email: str = Field(unique=True, index=True)
    hashed_password: str = Field(sa_column_kwargs={"nullable": False})
    profile_photo_url: str | None = Field(default=None, max_length=500)
    bio: str | None = Field(default=None, max_length=500)
    last_name: str | None = Field(default=None, max_length=100)
    date_of_birth: datetime | None = Field(default=None)
    address: str | None = Field(default=None, max_length=500)
    phone_number: str | None = Field(default=None, max_length=20)
    gender: str | None = Field(default=None, max_length=20)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Relationship to tasks with cascade delete
    tasks: list["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "select"},
    )

    # Relationship to notifications
    notifications: list["Notification"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "select"},
    )
