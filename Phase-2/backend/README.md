# Backend API - Phase 2 Todo Application

This is the backend API for the Phase 2 Todo application, implementing secure multi-user task management with JWT authentication, Neon PostgreSQL persistence, and comprehensive REST API endpoints.

## Features

### User Story 1: Secure Task Management (P1 - MVP)
- Secure user authentication with JWT tokens
- Multi-user data isolation
- Create and view tasks with user ownership enforcement
- Error handling with standardized responses

### User Story 2: Task Updates and Completion (P2)
- **Full Task Updates**: PUT /api/tasks/{id} - Replace entire task with new data
- **Partial Task Updates**: PATCH /api/tasks/{id} - Update specific fields only
- **Task Completion Toggle**: PATCH /api/tasks/{id}/complete - Toggle completion status
- Input validation for titles (1-200 chars) and descriptions (max 1000 chars)
- Proper error responses (422 for validation, 403 for unauthorized access)

### User Story 3: Task Deletion (P3)
- **Task Deletion**: DELETE /api/tasks/{id} - Delete a specific task
- Returns 204 No Content on successful deletion
- Enforces user ownership validation
- Supports cascade delete behavior at database level

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User signup
- `POST /api/auth/signin` - User signin

### Task Management
- `GET /api/tasks` - Get all tasks for authenticated user
- `GET /api/tasks/{id}` - Get specific task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Full task update
- `PATCH /api/tasks/{id}` - Partial task update
- `PATCH /api/tasks/{id}/complete` - Toggle task completion
- `DELETE /api/tasks/{id}` - Delete task

## Security Features

- JWT token-based authentication
- User data isolation (users can only access their own tasks)
- Input validation for all requests
- Proper error handling with status codes

## Technologies

- **Framework**: FastAPI
- **Database**: Neon PostgreSQL with SQLModel ORM
- **Authentication**: JWT verification with Better Auth
- **Testing**: pytest with async support
- **Type Safety**: Pydantic models

## Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Configure environment variables in `.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://username:password@localhost/dbname
   BETTER_AUTH_SECRET=your-secret-key
   DEBUG=true
   ```
3. Start the server: `uvicorn src.main:app --reload`
4. For production: `uvicorn src.main:app --host 0.0.0.0 --port 8000`

## Testing

Run the full test suite:
```bash
pytest tests/ -v
```

For coverage report:
```bash
pytest --cov=src tests/
```

## Running Dev/Prod Servers

Development:
```bash
uvicorn src.main:app --reload
```

Production:
```bash
uvicorn src.main:app --workers 4 --host 0.0.0.0 --port 8000
```

## Troubleshooting

- If you get database connection errors, ensure your Neon PostgreSQL connection is valid
- For authentication issues, verify your BETTER_AUTH_SECRET matches the frontend
- Check logs for detailed error information
- Run `python -m pytest tests/ -v -s` for verbose test output with print statements
