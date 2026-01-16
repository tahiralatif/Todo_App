# Quickstart Guide: Phase-2 Backend Evolution

**Feature**: `001-backend-evolution` | **Date**: 2026-01-08 | **Spec**: `spec.md`

This guide provides developers with quick reference for setting up, running, and testing the FastAPI backend during Phase-2 implementation.

---

## Environment Setup

### Prerequisites

- Python 3.13+
- `uv` package manager (installed globally)
- PostgreSQL 14+ (or Neon serverless PostgreSQL account)
- Git (for version control)

### Repository Structure

```
Phase-2/
├── backend/                # ← You are here
│   ├── src/
│   │   ├── main.py
│   │   ├── db.py
│   │   ├── models/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── schemas/
│   ├── tests/
│   ├── .env
│   ├── .env.example
│   ├── pyproject.toml
│   └── README.md
└── frontend/               # (separate concern)
```

---

## Local Development Setup

### 1. Clone and Navigate

```bash
cd Phase-2/backend
```

### 2. Create Virtual Environment

```bash
# Initialize project with uv
uv sync

# OR manually create and activate
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# or .\.venv\Scripts\activate  # Windows
```

### 3. Install Dependencies

```bash
# With uv
uv pip install -r pyproject.toml

# Or traditional pip
pip install fastapi uvicorn sqlmodel pydantic-settings pytest pytest-asyncio
```

### 4. Configure Environment Variables

```bash
# Copy example to .env
cp .env.example .env

# Edit .env and fill in:
DATABASE_URL=postgresql://user:pass@host:5432/todo_db
BETTER_AUTH_SECRET=your-better-auth-secret-key-here
DEBUG=true
```

**Required Variables**:
- `DATABASE_URL`: PostgreSQL connection string (format: `postgresql://user:password@host:port/dbname`)
- `BETTER_AUTH_SECRET`: Shared secret for JWT verification (must match frontend)

### 5. Initialize Database

```bash
# SQLModel auto-creates tables on startup
# Just run the application:
python -m uvicorn src.main:app --reload

# Check if tables were created:
# psql -d todo_db -c "\dt"
```

---

## Running the Application

### Development Server

```bash
# Start with hot-reload
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Output:
# Uvicorn running on http://0.0.0.0:8000
# API docs: http://localhost:8000/docs (Swagger UI)
# Alternative docs: http://localhost:8000/redoc
```

### Production Server

```bash
# Without hot-reload
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Testing the API

### Manual Testing with curl

#### 1. Signup (Create User)

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "id": "user_uuid",
#     "email": "user@example.com",
#     "created_at": "2026-01-08T10:30:00Z"
#   }
# }
```

#### 2. Signin (Get JWT)

```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": { "id": "user_uuid", "email": "user@example.com" }
#   }
# }

# Store the token:
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 3. Create Task

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Phase II",
    "description": "Implement all backend endpoints"
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "id": 1,
#     "user_id": "user_uuid",
#     "title": "Complete Phase II",
#     "description": "Implement all backend endpoints",
#     "completed": false,
#     "created_at": "2026-01-08T10:30:00Z",
#     "updated_at": "2026-01-08T10:30:00Z"
#   }
# }
```

#### 4. List Tasks

```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $JWT_TOKEN"

# Response: array of tasks
```

#### 5. Update Task (PATCH)

```bash
curl -X PATCH http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

#### 6. Delete Task

```bash
curl -X DELETE http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer $JWT_TOKEN"

# Response: 204 No Content or 200 OK with empty data
```

### Running Unit & Integration Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run tests matching pattern
pytest -k "test_create_task"

# Run with coverage report
pytest --cov=src --cov-report=html

# Run async tests
pytest --asyncio-mode=auto
```

**Test Files**:
- `tests/test_auth.py` — Authentication endpoints
- `tests/test_tasks.py` — Task CRUD operations
- `tests/test_user_isolation.py` — Cross-user access prevention
- `tests/test_edge_cases.py` — Invalid UUIDs, token expiry, concurrency

---

## Architecture Overview

### Request Flow

```
HTTP Request
    ↓
FastAPI Route Handler (thin)
    ↓
Authentication Middleware (JWT verification, user_id extraction)
    ↓
Service Layer (business logic, user scoping)
    ↓
SQLModel Query (database)
    ↓
Response Formatting Middleware (standardized envelope)
    ↓
HTTP Response (JSON)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/main.py` | FastAPI app initialization, middleware setup, route registration |
| `src/db.py` | Database connection, session management, engine configuration |
| `src/models/user.py` | User SQLModel entity |
| `src/models/task.py` | Task SQLModel entity |
| `src/services/auth_service.py` | JWT verification, user creation |
| `src/services/task_service.py` | Task CRUD, validation, user isolation |
| `src/routes/auth.py` | POST /api/auth/signup, signin endpoints |
| `src/routes/tasks.py` | Task endpoints (GET, POST, PUT, PATCH, DELETE) |
| `src/middleware/auth.py` | JWT verification middleware |
| `src/middleware/errors.py` | Global error handling |
| `src/schemas/auth.py` | Pydantic models for auth |
| `src/schemas/task.py` | Pydantic models for tasks |

---

## User Isolation & Security

### JWT Verification Flow

1. **Frontend** sends request with `Authorization: Bearer <jwt_token>` header
2. **Backend Auth Middleware**:
   - Extracts token from header
   - Verifies signature using `BETTER_AUTH_SECRET`
   - Validates expiry (must not be past current time)
   - Extracts `sub` claim (user_id)
3. **Service Layer**:
   - Creates User record if doesn't exist (lazy creation)
   - Filters all task queries by extracted user_id
4. **Response**: Task data only for authenticated user

### Critical Rules (Non-Negotiable)

✅ **DO**:
- Extract user_id from JWT `sub` claim ONLY
- Filter all task queries by authenticated user_id
- Return 403 Forbidden for cross-user access attempts
- Verify JWT signature and expiry on every request

❌ **DON'T**:
- Trust user_id from request body or URL
- Skip JWT verification for any endpoint
- Allow queries that bypass user_id filtering
- Return user data from different authenticated sessions

---

## Database Queries

### User Query (by JWT sub)

```python
from sqlmodel import select, Session
from src.models import User

async def get_or_create_user(session: Session, user_id: str, email: str):
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()

    if not user:
        user = User(id=user_id, email=email)
        session.add(user)
        session.commit()

    return user
```

### Task Query (with user isolation)

```python
async def get_user_tasks(session: Session, user_id: str):
    statement = select(Task).where(Task.user_id == user_id)
    return session.exec(statement).all()
```

### Task Query (single task with isolation)

```python
async def get_task(session: Session, task_id: int, user_id: str):
    statement = select(Task).where(
        (Task.id == task_id) & (Task.user_id == user_id)
    )
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task
```

---

## Troubleshooting

### Issue: "Database connection refused"

**Solution**:
1. Check `DATABASE_URL` in `.env`
2. Verify Neon PostgreSQL credentials
3. Test connection: `psql <DATABASE_URL>`

### Issue: "JWT verification failed"

**Solution**:
1. Verify `BETTER_AUTH_SECRET` matches between frontend and backend
2. Check token expiry: `jwt.decode(token, options={"verify_exp": False})`
3. Ensure Authorization header format: `Bearer <token>` (not "JWT", "Token", etc.)

### Issue: "Tables not created"

**Solution**:
1. Ensure `src/models/user.py` and `src/models/task.py` are imported in `src/main.py`
2. Check SQLModel metadata: `SQLModel.metadata.create_all(engine)`
3. Verify database user has CREATE TABLE permissions

### Issue: "Test failures"

**Solution**:
1. Use test database (not production)
2. Run `pytest --asyncio-mode=auto` for async support
3. Check conftest.py fixtures for test database setup

---

## Performance Optimization

### Response Time Goals

- **GET /api/tasks**: <1 second for max 100 tasks (SC-003)
- **POST /api/tasks**: <500ms
- **PATCH /api/tasks/{id}**: <500ms

### Optimization Techniques

1. **Index Strategy**: User ID and completion status indexed
2. **Query Efficiency**: Use SQLModel select() to avoid N+1 queries
3. **Connection Pooling**: Neon handles connection pooling; verify pool_pre_ping=True
4. **Async I/O**: Use `async` route handlers and `asyncpg` driver

### Monitoring

```bash
# Check query performance
POSTGRES_DEBUG=true python -m uvicorn src.main:app --reload

# Profile with cProfile
python -m cProfile -s cumulative src/main.py
```

---

## Next Steps

1. **Implementation**: Use `sp.tasks` command to generate detailed task breakdown
2. **Git Workflow**: Create feature branch `001-backend-evolution`
3. **Testing**: Implement all test files before code
4. **Integration**: Connect frontend (Next.js) to backend API
5. **Deployment**: Deploy to Vercel (frontend) + Railway/Heroku (backend)

---

## Useful Commands

```bash
# Format code
black src/ tests/

# Lint
flake8 src/ tests/

# Type checking
mypy src/

# Generate requirements
uv pip freeze > requirements.txt

# Clean cache
find . -type d -name __pycache__ -exec rm -r {} +

# Interactive Python shell with app context
python -c "from src.main import app; import asyncio"
```

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Better Auth Documentation](https://www.betterauth.dev/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs/)
- [pytest Async Documentation](https://pytest-asyncio.readthedocs.io/)

---

## Support

For questions or issues:
1. Check this quickstart guide
2. Review `/specs/001-backend-evolution/spec.md` for full specification
3. Consult `data-model.md` for schema details
4. Review `contracts.md` for API specifications
