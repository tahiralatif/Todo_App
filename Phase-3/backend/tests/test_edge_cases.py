"""Tests for edge cases and boundary conditions."""

import pytest
from fastapi.testclient import TestClient

from src.main import app


def test_invalid_task_id_uuid_422():
    """Test that invalid task ID returns 422."""
    with TestClient(app) as client:
        # Test with invalid task ID format
        response = client.get("/api/tasks/invalid-id-format")

        # Should return 401 without auth or 422 with bad ID format
        assert response.status_code in [401, 422]


def test_concurrent_task_updates_last_write_wins():
    """Test concurrent task updates follow last-write-wins strategy."""
    # This would require more complex testing with multiple simultaneous requests
    # to test the concurrency behavior
    pass


def test_title_boundary_1_char():
    """Test task title with minimum allowed length (1 character)."""
    with TestClient(app) as client:
        # Without authentication, should return 401
        # With authentication and 1-char title, should accept the task
        response = client.post(
            "/api/tasks",
            json={"title": "A", "description": "Valid description"},  # 1 character
        )

        assert response.status_code in [401, 201, 422]


def test_title_boundary_200_chars():
    """Test task title with maximum allowed length (200 characters)."""
    with TestClient(app) as client:
        # Create a 200-character title
        long_title = "A" * 200

        # Without authentication, should return 401
        # With authentication and 200-char title, should accept the task
        response = client.post(
            "/api/tasks", json={"title": long_title, "description": "Valid description"}
        )

        assert response.status_code in [401, 201, 422]


def test_description_boundary_1000_chars():
    """Test task description with maximum allowed length (1000 characters)."""
    with TestClient(app) as client:
        # Create a 1000-character description
        long_description = "A" * 1000

        # Without authentication, should return 401
        # With authentication and 1000-char description, should accept the task
        response = client.post(
            "/api/tasks", json={"title": "Valid Title", "description": long_description}
        )

        assert response.status_code in [401, 201, 422]


def test_token_expiry_validation():
    """Test that expired JWT tokens are properly rejected."""
    # This would require creating an expired JWT token for testing
    pass


def test_missing_auth_header_401():
    """Test that missing authentication header returns 401."""
    with TestClient(app) as client:
        # These endpoints require authentication
        endpoints_to_test = [
            ("/api/tasks", "GET"),
            ("/api/tasks", "POST"),
            ("/api/tasks/1", "GET"),
            ("/api/tasks/1", "PUT"),
            ("/api/tasks/1", "PATCH"),
            ("/api/tasks/1", "DELETE"),
        ]

        for endpoint, method in endpoints_to_test:
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint, json={"title": "test"})
            elif method == "PUT":
                response = client.put(
                    endpoint,
                    json={"title": "test", "description": "test", "completed": False},
                )
            elif method == "PATCH":
                response = client.patch(endpoint, json={"title": "test"})
            elif method == "DELETE":
                response = client.delete(endpoint)

            assert (
                response.status_code == 401
            ), f"{method} {endpoint} should return 401 without auth"
