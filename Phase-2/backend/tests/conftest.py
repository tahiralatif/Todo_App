"""Pytest fixtures for backend API tests."""

import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel

from src.main import app
from src.db import get_session
from src.models.user import User
from src.models.task import Task


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_db_session():
    """Create a test database session using in-memory SQLite."""
    from sqlalchemy.ext.asyncio import create_async_engine

    # Use in-memory SQLite for testing
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        poolclass=StaticPool,
        echo=True,
        connect_args={"check_same_thread": False},
    )

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session

    await engine.dispose()


@pytest_asyncio.fixture
async def async_client(test_db_session):
    """Create an async test client with dependency override."""

    async def override_get_session():
        yield test_db_session

    app.dependency_overrides[get_session] = override_get_session

    from fastapi.testclient import TestClient

    # Use FastAPI's TestClient for sync testing
    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_user(test_db_session):
    """Create a sample user for testing."""
    from sqlalchemy import select

    user = User(
        id="test-user-id",
        email="test@example.com",
    )
    test_db_session.add(user)
    await test_db_session.commit()
    await test_db_session.refresh(user)

    return user


@pytest_asyncio.fixture
async def sample_task(test_db_session, sample_user):
    """Create a sample task for testing."""
    from src.models.task import Task

    task = Task(
        user_id=sample_user.id,
        title="Test Task",
        description="Test Description",
        completed=False,
    )
    test_db_session.add(task)
    await test_db_session.commit()
    await test_db_session.refresh(task)

    return task
