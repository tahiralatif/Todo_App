"""TaskManager service module."""

import json
import os
from datetime import datetime
from typing import Optional

from src.models.user import Task


class TaskManager:
    """Manages task storage and operations with file-based persistence.

    This class implements the Singleton pattern to ensure a single
    shared instance across the application lifecycle.
    Tasks are saved to a JSON file for persistence.
    """

    _instance: Optional["TaskManager"] = None
    _next_id: int = 1
    _tasks: list[Task] = []
    _DATA_FILE: str = "data/tasks.json"

    def __new__(cls) -> "TaskManager":
        """Create a singleton instance of TaskManager.

        Returns:
            The singleton TaskManager instance.
        """
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load()
        return cls._instance

    def _ensure_data_dir(self) -> None:
        """Ensure the data directory exists."""
        data_dir = os.path.dirname(self._DATA_FILE)
        if data_dir and not os.path.exists(data_dir):
            os.makedirs(data_dir)

    def _save(self) -> None:
        """Save all tasks to the JSON file."""
        self._ensure_data_dir()
        data = {
            "next_id": self._next_id,
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "created_at": (
                        task.created_at.isoformat() if task.created_at else None
                    ),
                }
                for task in self._tasks
            ],
        }
        with open(self._DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _load(self) -> None:
        """Load tasks from the JSON file."""
        if not os.path.exists(self._DATA_FILE):
            self._tasks = []
            self._next_id = 1
            return

        try:
            with open(self._DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)

            self._next_id = data.get("next_id", 1)
            self._tasks = []
            for task_data in data.get("tasks", []):
                created_at = None
                if task_data.get("created_at"):
                    created_at = datetime.fromisoformat(task_data["created_at"])
                task = Task(
                    id=task_data["id"],
                    title=task_data["title"],
                    description=task_data.get("description"),
                    completed=task_data.get("completed", False),
                    created_at=created_at,
                )
                self._tasks.append(task)
        except (json.JSONDecodeError, KeyError, OSError):
            self._tasks = []
            self._next_id = 1

    @classmethod
    def reset(cls) -> None:
        """Reset the singleton state (primarily for testing).

        This clears all tasks, resets the ID counter, and removes the persistence file.
        """
        if os.path.exists(cls._DATA_FILE):
            try:
                os.remove(cls._DATA_FILE)
            except OSError:
                pass
        cls._instance = None
        cls._next_id = 1
        cls._tasks = []

    def create_task(self, title: str, description: Optional[str] = None) -> Task:
        """Create and store a new task.

        Args:
            title: The task title (required).
            description: Optional task description.

        Returns:
            The created Task instance.

        Raises:
            ValueError: If title validation fails.
        """
        task = Task(
            id=self._next_id,
            title=title,
            description=description,
            completed=False,
            created_at=datetime.now(),
        )
        self._tasks.append(task)
        self._next_id += 1
        self._save()
        return task

    def get_all_tasks(self) -> list[Task]:
        """Return all tasks.

        Returns:
            A copy of the task list to prevent external modification.
        """
        return self._tasks.copy()

    def get_task_by_id(self, id: int) -> Optional[Task]:
        """Retrieve a task by its ID.

        Args:
            id: The task ID to search for.

        Returns:
            The Task if found, None otherwise.
        """
        for task in self._tasks:
            if task.id == id:
                return task
        return None

    def update_task(
        self,
        id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Task:
        """Update task fields. Only non-None values are updated.

        Args:
            id: The task ID to update.
            title: New title (optional). If provided and non-empty, updates the title.
            description: New description (optional). If provided, updates the description.

        Returns:
            The updated Task instance.

        Raises:
            KeyError: If task with given ID is not found.
            ValueError: If validation fails.
        """
        task = self.get_task_by_id(id)
        if task is None:
            raise KeyError(f"Task {id} not found")
        task.update(title, description)
        self._save()
        return task

    def delete_task(self, id: int) -> None:
        """Delete a task by its ID.

        Args:
            id: The task ID to delete.

        Raises:
            KeyError: If task with given ID is not found.
        """
        task = self.get_task_by_id(id)
        if task is None:
            raise KeyError(f"Task {id} not found")
        self._tasks.remove(task)
        self._save()

    def mark_complete(self, id: int) -> Task:
        """Mark a task as completed.

        Args:
            id: The task ID to mark as complete.

        Returns:
            The updated Task instance.

        Raises:
            KeyError: If task with given ID is not found.
            ValueError: If task is already completed.
        """
        task = self.get_task_by_id(id)
        if task is None:
            raise KeyError(f"Task {id} not found")
        if task.completed:
            raise ValueError(f"Task {id} already completed")
        task.completed = True
        self._save()
        return task
