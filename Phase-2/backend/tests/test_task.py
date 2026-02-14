"""Unit tests for the Task model."""

import pytest
from datetime import datetime

from src.models.user import Task


class TestTaskInitialization:
    """Tests for Task initialization and validation."""

    def test_create_task_with_required_fields(self) -> None:
        """Test creating a task with only required fields."""
        task = Task(id=1, title="Test Task")
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description is None
        assert task.completed is False
        # Note: created_at is None when created directly (TaskManager sets it)

    def test_create_task_with_all_fields(self) -> None:
        """Test creating a task with all fields."""
        now = datetime.now()
        task = Task(
            id=1,
            title="Test Task",
            description="Test Description",
            completed=False,
            created_at=now,
        )
        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.completed is False
        assert task.created_at == now

    def test_create_task_with_empty_description(self) -> None:
        """Test that empty description is stored as None."""
        task = Task(id=1, title="Test", description="")
        assert task.description is None


class TestTaskValidation:
    """Tests for Task validation rules."""

    def test_valid_title_length_boundaries(self) -> None:
        """Test valid title length at boundaries."""
        # Minimum length (1 char)
        task = Task(id=1, title="A")
        assert task.title == "A"

        # Maximum length (100 chars)
        task = Task(id=1, title="A" * 100)
        assert len(task.title) == 100

    def test_title_too_short_raises_error(self) -> None:
        """Test that empty title raises ValueError."""
        with pytest.raises(ValueError, match="Title must be 1-100 characters"):
            Task(id=1, title="")

    def test_title_too_long_raises_error(self) -> None:
        """Test that title over 100 characters raises ValueError."""
        with pytest.raises(ValueError, match="Title must be 1-100 characters"):
            Task(id=1, title="A" * 101)

    def test_title_whitespace_only_raises_error(self) -> None:
        """Test that whitespace-only title raises ValueError."""
        with pytest.raises(ValueError, match="Title must be 1-100 characters"):
            Task(id=1, title="   ")

    def test_description_too_long_raises_error(self) -> None:
        """Test that description over 500 characters raises ValueError."""
        with pytest.raises(ValueError, match="Description must be max 500 characters"):
            Task(id=1, title="Valid", description="A" * 501)

    def test_title_is_stripped(self) -> None:
        """Test that title whitespace is stripped."""
        task = Task(id=1, title="  Test Task  ")
        assert task.title == "Test Task"

    def test_description_is_stripped(self) -> None:
        """Test that description whitespace is stripped."""
        task = Task(id=1, title="Test", description="  Test Description  ")
        assert task.description == "Test Description"


class TestTaskUpdate:
    """Tests for Task.update() method."""

    def test_update_title_only(self) -> None:
        """Test updating only the title."""
        task = Task(id=1, title="Original")
        task.update(title="Updated")
        assert task.title == "Updated"

    def test_update_description_only(self) -> None:
        """Test updating only the description."""
        task = Task(id=1, title="Test")
        task.update(description="New Description")
        assert task.description == "New Description"

    def test_update_both_fields(self) -> None:
        """Test updating both title and description."""
        task = Task(id=1, title="Original", description="Old")
        task.update(title="New", description="Updated")
        assert task.title == "New"
        assert task.description == "Updated"

    def test_update_with_empty_title_does_not_change(self) -> None:
        """Test that empty title in update doesn't change the title."""
        task = Task(id=1, title="Original")
        task.update(title="")
        assert task.title == "Original"

    def test_update_with_whitespace_title_does_not_change(self) -> None:
        """Test that whitespace title in update doesn't change the title."""
        task = Task(id=1, title="Original")
        task.update(title="   ")
        assert task.title == "Original"

    def test_update_description_to_none(self) -> None:
        """Test updating description to empty string sets it to None."""
        task = Task(id=1, title="Test", description="Old")
        task.update(description="")
        assert task.description is None

    def test_update_validates_new_values(self) -> None:
        """Test that update validates the new values."""
        task = Task(id=1, title="Test")
        with pytest.raises(ValueError, match="Title must be 1-100 characters"):
            task.update(title="A" * 101)


class TestTaskConstants:
    """Tests for Task validation constants."""

    def test_title_length_constant(self) -> None:
        """Test title length constant is correct."""
        assert Task.VALID_TITLE_LENGTH == (1, 100)

    def test_description_length_constant(self) -> None:
        """Test description length constant is correct."""
        assert Task.VALID_DESCRIPTION_LENGTH == (0, 500)
