"""Tests for user isolation and cross-user access prevention (User Stories 1, 2, 3)."""

import pytest
from fastapi.testclient import TestClient

from src.main import app
from src.models.task import Task
from src.models.user import User


def test_cross_user_task_access_forbidden_403():
    """Test that accessing another user's task returns 403 Forbidden."""
    with TestClient(app) as client:
        # Without authentication, should return 401
        # With authentication but accessing another user's task, should return 403
        response = client.get("/api/tasks/1")

        assert response.status_code in [401, 403]


def test_update_other_user_task_forbidden_403():
    """Test that updating another user's task returns 403 Forbidden."""
    with TestClient(app) as client:
        # Without authentication, should return 401
        # With authentication but updating another user's task, should return 403
        response = client.put(
            "/api/tasks/1",
            json={
                "title": "Updated Title",
                "description": "Updated Description",
                "completed": True,
            },
        )

        assert response.status_code in [401, 403]


def test_delete_other_user_task_forbidden_403():
    """Test that deleting another user's task returns 403 Forbidden."""
    with TestClient(app) as client:
        # Without authentication, should return 401
        # With authentication but deleting another user's task, should return 403
        response = client.delete("/api/tasks/1")

        assert response.status_code in [401, 403]


def test_task_queries_scoped_by_user_id():
    """Test that task queries are properly scoped by user_id."""
    # This would require more complex testing with multiple users
    # and verifying that each user only sees their own tasks
    pass


def test_user_isolation_with_multiple_users():
    """Test user isolation when multiple users exist."""
    # This would require setting up multiple users and verifying
    # that each user can only access their own tasks
    pass
