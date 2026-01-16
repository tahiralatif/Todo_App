# Data Model: Phase-2 Backend Evolution

**Feature**: `001-backend-evolution` | **Date**: 2026-01-08 | **Spec**: `spec.md`

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the Phase-2 Todo application backend. All models use SQLModel (Pydantic + SQLAlchemy) for type-safe ORM operations with Neon PostgreSQL.

---

## Entity 1: User

**Purpose**: Represent a registered user with multi-user isolation.

**Table Name**: `users`

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Primary Key | Unique user identifier from Better Auth |
| `email` | String | Unique, Indexed, NOT NULL | User email address (used for authentication) |
| `created_at` | DateTime | Default: now() | Account creation timestamp |

### Validation Rules

- **Email**: Must be unique across all users (409 Conflict if duplicate)
- **ID**: Fixed-length UUID string from Better Auth `sub` claim
- **created_at**: Auto-set to current timestamp on record creation

### Relationships

- One-to-Many: User → Tasks (a user has many tasks)
  - Foreign key: `tasks.user_id` → `users.id`
  - ON DELETE CASCADE (deleting user deletes all tasks)

### Lazy Creation Pattern

- **When Created**: On-demand when JWT `sub` claim is first used in an API request
- **Trigger**: First successful JWT verification that extracts a new `sub` value (e.g., first task creation by authenticated user)
- **Pattern**: Service layer checks if user exists before operating on tasks; creates if missing

### SQLModel Definition

```python
# backend/src/models/user.py
from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)  # UUID from Better Auth sub claim
    email: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.now)
```

---

## Entity 2: Task

**Purpose**: Represent a to-do item with multi-user isolation and lifecycle management.

**Table Name**: `tasks`

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Auto-increment | Unique task identifier |
| `user_id` | String (UUID) | Foreign Key → `users.id`, Indexed, NOT NULL | Owner of task; enables user isolation |
| `title` | String | Max 200 chars, NOT NULL | Task title (required) |
| `description` | String | Max 1000 chars, Optional | Task description (optional) |
| `completed` | Boolean | Default: false, Indexed | Completion status toggle |
| `created_at` | DateTime | Default: now() | Task creation timestamp |
| `updated_at` | DateTime | Default: now(), Updated on all mutations | Last modification timestamp |

### Validation Rules

- **Title**: Required, minimum 1 character, maximum 200 characters
- **Description**: Optional, maximum 1000 characters
- **Completed**: Boolean, defaults to `false`
- **User Isolation**: All task queries MUST be scoped by `user_id` (non-negotiable)
- **UUID Validation**: Invalid UUIDs return 422 Validation Error

### State Transitions

```
Task Lifecycle:
┌─────────┐
│ Created │  (initial state: completed=false)
└────┬────┘
     │
     ├─→ Updated ──┐ (any field modified, updated_at changes)
     │             │
     ├─→ Completed ┘ (toggled via PATCH /api/tasks/{id}/complete)
     │
     └─→ Deleted (permanent removal via DELETE /api/tasks/{id})

Note: Last-Write-Wins concurrency strategy (no optimistic locking in Phase II)
```

### Indexes

- `tasks.user_id` — Fast filtering by user (critical for query performance)
- `tasks.completed` — Fast status-based queries (future Phase III sorting/filtering)

### Relationships

- Many-to-One: Task → User
  - Foreign key: `tasks.user_id` → `users.id`
  - ON DELETE CASCADE (deleting user deletes tasks)

### SQLModel Definition

```python
# backend/src/models/task.py
from sqlmodel import SQLModel, Field
from datetime import datetime

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
```

---

## Database Schema (SQL)

### Users Table

```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### Tasks Table

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

---

## Request/Response Schemas

### User Schema (Response)

```python
# backend/src/schemas/auth.py
class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime
```

### Task Schema (Request)

```python
# backend/src/schemas/task.py
class TaskCreate(BaseModel):
    title: str  # 1-200 chars
    description: str | None = None  # 0-1000 chars

class TaskUpdate(BaseModel):
    title: str | None = None  # Optional partial update
    description: str | None = None
    completed: bool | None = None

class TaskComplete(BaseModel):
    completed: bool  # Toggle completion status
```

### Task Schema (Response)

```python
class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime
```

---

## Data Integrity Rules

### Non-Negotiable Constraints

1. **User Isolation**: Every task query MUST include `WHERE user_id = {authenticated_user_id}`
2. **No Trust from Client**: Backend MUST extract `user_id` from JWT `sub` claim only, never from request body
3. **Unique Email**: Duplicate registration attempts return 409 Conflict
4. **Cascade Delete**: Deleting a user automatically deletes all their tasks
5. **Concurrency**: Last-Write-Wins strategy; no optimistic locking in Phase II

### Error Scenarios

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|-----------|---------|
| Cross-user task access | 403 | FORBIDDEN | User lacks permission to access this task |
| Invalid UUID format | 422 | VALIDATION_ERROR | Invalid task ID format |
| Task not found | 404 | RESOURCE_NOT_FOUND | Task does not exist |
| Duplicate email on signup | 409 | CONFLICT | Email already registered |
| Invalid title (empty) | 422 | VALIDATION_ERROR | Title must be between 1-200 characters |
| Title too long (>200) | 422 | VALIDATION_ERROR | Title must be between 1-200 characters |
| Description too long (>1000) | 422 | VALIDATION_ERROR | Description must not exceed 1000 characters |
| Missing authentication | 401 | AUTH_REQUIRED | Authorization token required |
| Expired token | 401 | INVALID_TOKEN | Token has expired |

---

## Migration Strategy

**Phase II MVP**: SQLModel auto-creates tables on application startup (no Alembic migrations).

```python
# backend/src/main.py (startup)
from sqlmodel import SQLModel, create_engine, Session
from .models import User, Task

# Create all tables on startup
SQLModel.metadata.create_all(engine)
```

**Future Phases**: Consider Alembic for versioned migrations once schema stabilizes.

---

## Notes

- All timestamps use UTC (CURRENT_TIMESTAMP in PostgreSQL)
- Neon serverless PostgreSQL handles connection pooling automatically
- SQLModel provides async query support via async_engine
- Type safety via Pydantic and SQLModel prevents data inconsistencies
