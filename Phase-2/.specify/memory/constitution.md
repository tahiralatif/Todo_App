<!--
Sync Impact Report:
- Version: 0.2.0 -> 0.3.0 (Phase II Complete Specification)
- Created: 2026-01-01
- Last Amended: 2026-01-07
- Phase: Phase II — Full-Stack Web Application
- Templates Status:
  ✅ Constitution fully updated with all technical specifications
  ✅ Database schema defined
  ✅ API standards documented
  ✅ Authentication flow clarified
  ✅ Migration strategy from Phase I documented
- Follow-up TODOs: None
-->

# Constitution.md

## Phase II — Full-Stack Web Application
### From CLI System to Production-Grade Multi-User Application

---

## Repository Information

**Project Repository:** https://github.com/tahiralatif/Todo-App

This repository contains Phase II of the "Evolution of Todo" hackathon project. The project builds on the completed Phase I (CLI, in-memory application) and evolves into a full-stack web architecture with persistent storage and multi-user support. It strictly follows Spec-Driven, AI-Native Development.

---

## Purpose & Intent of Phase II

The goal of Phase II is to evolve the Todo application from a console-based system into a production-style full-stack architecture, demonstrating:

- Backend API design using **FastAPI**
- Frontend web application using **Next.js**
- Persistent storage with **Neon PostgreSQL**
- User authentication with **Better Auth + JWT**
- Multi-user data isolation
- Proper separation of concerns (backend vs frontend)
- Spec-driven, AI-assisted development
- Incremental system evolution across phases

---

## Phase Boundary & Migration Strategy

### Phase I (Completed & Frozen):
- **UI:** CLI-based (Rich/Questionary)
- **Storage:** In-memory (Python lists/JSON file)
- **Architecture:** Monolithic console application
- **Users:** Single user (no authentication)

### Phase II (Current):
- **UI:** Web-based (Next.js + React)
- **Storage:** Neon PostgreSQL (persistent database)
- **Architecture:** Client-Server (FastAPI REST API)
- **Users:** Multi-user with authentication

### Code Migration from Phase I

#### ✅ What to Reuse:
1. **Domain Models:** Task entity structure and properties
2. **Business Logic:** TaskManager operations (CRUD, validation rules)
3. **Core Concepts:** Task lifecycle, completion status, data validation
4. **Validation Rules:** Title required (1-200 chars), description optional (max 1000 chars)

#### ❌ What to Rebuild:
1. **User Interface:** Replace CLI (Rich/Questionary) with REST API + Next.js web UI
2. **Storage Layer:** Replace in-memory/JSON with Neon PostgreSQL + SQLModel ORM
3. **Architecture:** Transform monolithic console app into client-server web application
4. **Authentication:** Add Better Auth + JWT (not present in Phase I)

#### Migration Guidelines:
- Keep Phase I code as **reference** in `Phase-1/` folder (do not delete)
- **Do not copy-paste** CLI interface code (Rich, Questionary) into Phase II
- **Adapt** Phase I business logic for database and multi-user context
- **Add** authentication and authorization layer
- **Preserve** core task management semantics and validation rules
- **Enhance** with features like user isolation, timestamps, and relational data

---

## Project Structure

Phase II strictly follows this monorepo structure:

```text
Todo-App/
├── Phase-1/                    # Phase I (frozen, reference only)
│   └── ...
├── Phase-2/                    # Phase II (active development)
│   ├── backend/
│   │   ├── src/
│   │   │   ├── main.py              # FastAPI app entry point
│   │   │   ├── db.py                # Database connection
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py          # User SQLModel
│   │   │   │   └── task.py          # Task SQLModel (adapted from Phase I)
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py          # Authentication endpoints
│   │   │   │   └── tasks.py         # Task CRUD endpoints
│   │   │   ├── services/
│   │   │   │   ├── __init__.py
│   │   │   │   └── task_service.py  # Business logic (adapted from Phase I)
│   │   │   └── middleware/
│   │   │       ├── __init__.py
│   │   │       └── auth.py          # JWT verification middleware
│   │   ├── tests/
│   │   │   ├── test_auth.py
│   │   │   └── test_tasks.py
│   │   ├── .env
│   │   ├── .gitignore
│   │   ├── .python-version
│   │   ├── pyproject.toml
│   │   ├── uv.lock
│   │   ├── README.md
│   │   └── CLAUDE.md
│   ├── frontend/
│   │   ├── app/
│   │   │   ├── page.tsx             # Task list page (protected)
│   │   │   ├── layout.tsx           # Root layout
│   │   │   └── auth/
│   │   │       ├── signin/
│   │   │       │   └── page.tsx     # Login page
│   │   │       └── signup/
│   │   │           └── page.tsx     # Signup page
│   │   ├── components/
│   │   │   ├── TaskList.tsx         # Task display component
│   │   │   ├── TaskForm.tsx         # Add/Edit task form
│   │   │   └── Navbar.tsx           # Navigation bar
│   │   ├── lib/
│   │   │   ├── api.ts               # Centralized API client
│   │   │   └── auth.ts              # Better Auth configuration
│   │   ├── .env.local
│   │   ├── .gitignore
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   ├── README.md
│   │   └── CLAUDE.md
│   ├── CLAUDE.md                # Root instructions
│   └── README.md                # Project overview
```

No additional top-level folders are allowed within `Phase-2/`.

---

## Non-Negotiable Rules

### 1. Spec-Driven Development (Mandatory)
- Every feature must begin with a written Markdown specification in `/specs` folder
- No implementation is allowed without an approved spec
- All changes must be driven by spec updates, not ad-hoc coding
- Specs must follow Spec-Kit Plus conventions and structure

### 2. AI-Assisted Implementation
- Code generation must be performed using Claude Code
- Manual coding should be minimized and limited to orchestration
- Corrections must be achieved by refining specifications, not manual code edits
- Use `@specs/` references when working with Claude Code

### 3. Feature Isolation & Version Control
- Each feature must be developed in its own Git branch
- Branch naming: `feature/phase2-<feature-name>` (e.g., `feature/phase2-authentication`)
- Every feature must be merged via a Pull Request
- No direct commits to `main`
- PR must include: code, tests, and updated documentation

### 4. Phase Isolation
- Phase II must not break or alter Phase I code
- Phase I code remains in `Phase-1/` folder as reference
- Conceptual and logical reuse is encouraged
- Direct copy-paste of CLI code is forbidden

### 5. No Manual Code Without Spec
- **NEVER** write production code manually
- If code needs fixing, **update the spec** and regenerate
- Claude Code is the implementation engine
- Developer is the architect and reviewer

---

## Architectural Principles

### 1. Backend-First API Design
- Backend exposes a clean, versioned, documented REST API
- Frontend consumes backend APIs exclusively via HTTP
- No shared state or direct database access from frontend
- API responses follow consistent JSON structure

### 2. Object-Oriented Backend Architecture
- Use Python classes to encapsulate domain logic
- Avoid monolithic or procedural code
- Clear separation: routing, services, models, middleware
- Services contain business logic (adapted from Phase I TaskManager)
- Routes handle HTTP request/response only

### 3. Modular & Scalable Code
- Clear folder responsibilities and predictable naming conventions
- Code should be self-documenting with minimal comments
- Designed for future extension (Phase III: AI Chatbot, Phase IV: Kubernetes)
- Single Responsibility Principle for all modules

### 4. Security First
- All API endpoints require JWT authentication
- User data isolation enforced at database query level
- Environment variables for all secrets
- CORS configured for frontend origin only

---

## Technology Stack

### Backend
- **Language:** Python 3.13+
- **Framework:** FastAPI (async ASGI framework)
- **ORM:** SQLModel (Pydantic + SQLAlchemy)
- **Database:** Neon Serverless PostgreSQL
- **Package Manager:** `uv` (not pip)
- **Project Init:** `uv init`
- **Testing:** pytest with async support
- **API Style:** RESTful JSON APIs

### Frontend
- **Framework:** Next.js 15+ (App Router, not Pages Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (utility-first, no inline styles)
- **Authentication:** Better Auth (JWT-based)
- **State Management:** React hooks (useState, useEffect)
- **HTTP Client:** Native fetch API
- **Package Manager:** npm or pnpm

### Database
- **Provider:** Neon (Serverless PostgreSQL)
- **ORM:** SQLModel
- **Migrations:** Auto-generated by SQLModel (no manual Alembic for Phase II)
- **Connection:** Environment variable `DATABASE_URL`

### Development Tools
- **Spec Management:** Spec-Kit Plus
- **AI Assistant:** Claude Code
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions (optional)

---

## Database Schema & ORM

### Neon PostgreSQL
- **Provider:** Neon Serverless PostgreSQL
- **Connection String:** `DATABASE_URL` environment variable
- **Format:** `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`
- **Schema Management:** SQLModel auto-creates tables on startup

### Database Schema

#### Users Table (Managed by Better Auth)
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**SQLModel Representation:**
```python
from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.now)
```

#### Tasks Table
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

**SQLModel Representation:**
```python
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

### Database Indexes
- `tasks.user_id` — Fast filtering by user
- `tasks.completed` — Fast status-based queries
- `users.email` — Fast authentication lookups

---

## REST API Standards

### Base URL Pattern
```
/api/{user_id}/tasks[/{task_id}]
```

### Authentication Header
All endpoints require JWT token:
```
Authorization: Bearer <jwt_token>
```

### HTTP Methods & Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | Create new user account | No |
| `POST` | `/api/auth/signin` | Login and get JWT token | No |
| `GET` | `/api/{user_id}/tasks` | List all user's tasks | Yes |
| `POST` | `/api/{user_id}/tasks` | Create new task | Yes |
| `GET` | `/api/{user_id}/tasks/{id}` | Get task by ID | Yes |
| `PUT` | `/api/{user_id}/tasks/{id}` | Update task (full) | Yes |
| `PATCH` | `/api/{user_id}/tasks/{id}` | Update task (partial) | Yes |
| `DELETE` | `/api/{user_id}/tasks/{id}` | Delete task | Yes |
| `PATCH` | `/api/{user_id}/tasks/{id}/complete` | Toggle completion status | Yes |

### Request/Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user_123",
    "title": "Complete Phase II",
    "description": "Finish full-stack implementation",
    "completed": false,
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T10:30:00Z"
  },
  "message": "Task created successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {
      "field": "title",
      "constraint": "not_empty"
    }
  }
}
```

---

## Authentication & Security

### Better Auth + FastAPI JWT Integration

#### Security Rules
1. **Token Verification:** Every protected endpoint validates JWT signature.
2. **User Isolation:** `user_id` in URL must match `sub` claim in JWT. Database queries ALWAYS filter by `user_id`.
3. **Shared Secret:** `BETTER_AUTH_SECRET` MUST be identical in frontend and backend.
4. **CORS Configuration:** Allow only frontend origin (e.g., `http://localhost:3000`).

---

## Frontend Architecture

### Technology Choices
- **Framework:** Next.js 15+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Better Auth with JWT
- **Data Fetching:** Native fetch API

---

## Governance

### Versioning Policy
- **MAJOR:** Breaking changes to principles or governance.
- **MINOR:** New principles or significant expansions (e.g., Phase shift).
- **PATCH:** Clarifications, wording improvements, typo fixes.

### Amendment Process
1. Propose amendment with rationale.
2. Update Constitution.md with version bump.
3. Commit with message: `docs: amend constitution to v<X.Y.Z> (<brief change>)`.

---

**Version:** 0.3.0
**Ratified:** 2026-01-01
**Last Amended:** 2026-01-07
**Phase:** II — Full-Stack Web Application
