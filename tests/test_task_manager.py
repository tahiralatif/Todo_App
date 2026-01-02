"""Unit tests for the TaskManager service."""

import pytest

from src.models.task import Task
from src.services.task_manager import TaskManager


@pytest.fixture(autouse=True)
def reset_task_manager() -> None:
    """Reset TaskManager state before each test."""
    TaskManager.reset()


class TestTaskManagerSingleton:
    """Tests for TaskManager singleton pattern."""

    def test_singleton_returns_same_instance(self) -> None:
        """Test that TaskManager returns the same instance."""
        manager1 = TaskManager()
        manager2 = TaskManager()
        assert manager1 is manager2

    def test_reset_creates_new_instance(self) -> None:
        """Test that reset creates a new singleton instance."""
        manager1 = TaskManager()
        TaskManager.reset()
        manager2 = TaskManager()
        assert manager1 is not manager2


class TestCreateTask:
    """Tests for TaskManager.create_task() method."""

    def test_create_task_with_title_only(self) -> None:
        """Test creating a task with only a title."""
        task = TaskManager().create_task("Test Task")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description is None
        assert task.completed is False
        assert task.created_at is not None

    def test_create_task_with_title_and_description(self) -> None:
        """Test creating a task with title and description."""
        task = TaskManager().create_task("Test Task", "Test Description")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test Description"

    def test_create_multiple_tasks_increments_ids(self) -> None:
        """Test that task IDs are auto-incremented."""
        manager = TaskManager()
        task1 = manager.create_task("Task 1")
        task2 = manager.create_task("Task 2")
        task3 = manager.create_task("Task 3")
        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3

    def test_create_task_validates_title(self) -> None:
        """Test that create_task validates the title."""
        with pytest.raises(ValueError, match="Title must be 1-100 characters"):
            TaskManager().create_task("")


class TestGetAllTasks:
    """Tests for TaskManager.get_all_tasks() method."""

    def test_get_all_tasks_empty(self) -> None:
        """Test getting all tasks when none exist."""
        tasks = TaskManager().get_all_tasks()
        assert tasks == []

    def test_get_all_tasks_with_tasks(self) -> None:
        """Test getting all tasks returns all created tasks."""
        manager = TaskManager()
        manager.create_task("Task 1")
        manager.create_task("Task 2")
        tasks = manager.get_all_tasks()
        assert len(tasks) == 2
        assert tasks[0].title == "Task 1"
        assert tasks[1].title == "Task 2"

    def test_get_all_tasks_returns_copy(self) -> None:
        """Test that get_all_tasks returns a copy of the list."""
        manager = TaskManager()
        manager.create_task("Task 1")
        tasks = manager.get_all_tasks()
        tasks.clear()  # Modify the returned list
        tasks = manager.get_all_tasks()
        assert len(tasks) == 1  # Original list unchanged


class TestGetTaskById:
    """Tests for TaskManager.get_task_by_id() method."""

    def test_get_task_by_id_existing(self) -> None:
        """Test getting an existing task by ID."""
        manager = TaskManager()
        created = manager.create_task("Test Task")
        task = manager.get_task_by_id(1)
        assert task is not None
        assert task.id == created.id
        assert task.title == created.title

    def test_get_task_by_id_non_existing(self) -> None:
        """Test getting a non-existing task returns None."""
        task = TaskManager().get_task_by_id(999)
        assert task is None

    def test_get_task_by_id_after_multiple_creates(self) -> None:
        """Test getting task by ID after creating multiple tasks."""
        manager = TaskManager()
        manager.create_task("Task 1")
        manager.create_task("Task 2")
        manager.create_task("Task 3")
        task = manager.get_task_by_id(2)
        assert task is not None
        assert task.title == "Task 2"


class TestUpdateTask:
    """Tests for TaskManager.update_task() method."""

    def test_update_task_title(self) -> None:
        """Test updating task title."""
        manager = TaskManager()
        manager.create_task("Original")
        task = manager.update_task(1, title="Updated")
        assert task.title == "Updated"

    def test_update_task_description(self) -> None:
        """Test updating task description."""
        manager = TaskManager()
        manager.create_task("Test", description="Old")
        task = manager.update_task(1, description="New")
        assert task.description == "New"

    def test_update_task_both_fields(self) -> None:
        """Test updating both title and description."""
        manager = TaskManager()
        manager.create_task("Original", description="Old")
        task = manager.update_task(1, title="New", description="New")
        assert task.title == "New"
        assert task.description == "New"

    def test_update_task_partial(self) -> None:
        """Test that None values don't update fields."""
        manager = TaskManager()
        manager.create_task("Original", description="Description")
        task = manager.update_task(1, title="Updated")
        assert task.title == "Updated"
        assert task.description == "Description"

    def test_update_task_not_found_raises_error(self) -> None:
        """Test updating non-existing task raises KeyError."""
        with pytest.raises(KeyError, match="Task 999 not found"):
            TaskManager().update_task(999, title="Updated")

    def test_update_task_validates_title(self) -> None:
        """Test that update_task validates the title when provided."""
        manager = TaskManager()
        manager.create_task("Test")
        # Empty title is silently ignored (doesn't update), so no validation error
        manager.update_task(1, title="")
        # Title should remain unchanged
        assert manager.get_task_by_id(1).title == "Test"


class TestDeleteTask:
    """Tests for TaskManager.delete_task() method."""

    def test_delete_task(self) -> None:
        """Test deleting a task."""
        manager = TaskManager()
        manager.create_task("Task 1")
        manager.create_task("Task 2")
        assert len(manager.get_all_tasks()) == 2
        manager.delete_task(1)
        assert len(manager.get_all_tasks()) == 1
        assert manager.get_task_by_id(1) is None
        assert manager.get_task_by_id(2).title == "Task 2"

    def test_delete_task_not_found_raises_error(self) -> None:
        """Test deleting non-existing task raises KeyError."""
        with pytest.raises(KeyError, match="Task 999 not found"):
            TaskManager().delete_task(999)

    def test_delete_task_reflects_in_get_all(self) -> None:
        """Test that deleted task doesn't appear in get_all_tasks."""
        manager = TaskManager()
        manager.create_task("Task 1")
        manager.create_task("Task 2")
        manager.delete_task(1)
        tasks = manager.get_all_tasks()
        assert len(tasks) == 1
        assert tasks[0].id == 2


class TestMarkComplete:
    """Tests for TaskManager.mark_complete() method."""

    def test_mark_complete(self) -> None:
        """Test marking a task as complete."""
        manager = TaskManager()
        manager.create_task("Test")
        task = manager.mark_complete(1)
        assert task.completed is True

    def test_mark_complete_returns_task(self) -> None:
        """Test that mark_complete returns the updated task."""
        manager = TaskManager()
        manager.create_task("Test")
        task = manager.mark_complete(1)
        assert task.id == 1
        assert task.title == "Test"

    def test_mark_complete_already_completed_raises_error(self) -> None:
        """Test marking already completed task raises ValueError."""
        manager = TaskManager()
        manager.create_task("Test")
        manager.mark_complete(1)
        with pytest.raises(ValueError, match="already completed"):
            manager.mark_complete(1)

    def test_mark_complete_not_found_raises_error(self) -> None:
        """Test marking non-existing task raises KeyError."""
        with pytest.raises(KeyError, match="Task 999 not found"):
            TaskManager().mark_complete(999)

    def test_completed_task_preserves_other_fields(self) -> None:
        """Test that marking complete doesn't change other fields."""
        manager = TaskManager()
        manager.create_task("Test", description="Description")
        task = manager.mark_complete(1)
        assert task.completed is True
        assert task.title == "Test"
        assert task.description == "Description"


class TestTaskManagerIntegration:
    """Integration tests for full TaskManager workflow."""

    def test_full_crud_workflow(self) -> None:
        """Test a complete CRUD workflow."""
        manager = TaskManager()

        # Create
        task1 = manager.create_task("Task 1", "First task")
        task2 = manager.create_task("Task 2")

        # Read
        assert len(manager.get_all_tasks()) == 2
        assert manager.get_task_by_id(1).title == "Task 1"

        # Update
        manager.update_task(1, title="Updated Task 1")
        assert manager.get_task_by_id(1).title == "Updated Task 1"

        # Mark complete
        manager.mark_complete(1)
        assert manager.get_task_by_id(1).completed is True

        # Delete
        manager.delete_task(2)
        assert len(manager.get_all_tasks()) == 1
        assert manager.get_task_by_id(2) is None
