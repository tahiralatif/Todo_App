# Quickstart Guide: Phase-3 AI Chatbot

**Specification**: `specs/001-ai-chatbot/spec.md` | **Date**: 2026-02-07

## Overview

This guide provides quick setup instructions for the Phase-3 AI Chatbot application, including environment setup, installation, and basic usage examples.

## Prerequisites

- Python 3.13+
- Node.js 18+ (for frontend)
- PostgreSQL-compatible database (Neon recommended)
- OpenAI API key
- Better Auth credentials

## Environment Setup

### Backend Setup

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd Todo_App/Phase-3/backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install uv  # or use your preferred package manager
uv sync  # or pip install -r requirements.txt
```

4. **Set up environment variables**:
Create a `.env` file in the backend root with:
```
DATABASE_URL=postgresql://username:password@localhost:5432/todo_ai_chatbot
OPENAI_API_KEY=your_openai_api_key_here
BETTER_AUTH_SECRET=your_better_auth_secret_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. **Initialize database**:
```bash
# Run database migrations
python -m src.db init
```

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd ../frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your_openai_domain_key_here
```

## Running the Application

### Backend

1. **Start the FastAPI server**:
```bash
cd backend
uv run uvicorn src.main:app --reload --port 8000
```

2. **Or use the main script**:
```bash
cd backend
python -m src.main
```

The backend will be available at `http://localhost:8000`

### Frontend

1. **Start the Next.js development server**:
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Testing

### Authentication

**Sign up a new user**:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securePassword123"
  }'
```

**Sign in**:
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securePassword123"
  }'
```

Save the returned token for authenticated requests.

### Chat Endpoint

**Start a new conversation**:
```bash
curl -X POST "http://localhost:8000/api/a1b2c3d4-e5f6-7890-1234-567890abcdef/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "message": "Add a task to buy groceries"
  }'
```

**Continue an existing conversation**:
```bash
curl -X POST "http://localhost:8000/api/a1b2c3d4-e5f6-7890-1234-567890abcdef/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "conversation_id": 123,
    "message": "Show me all my tasks"
  }'
```

## Unit/Integration Tests

### Backend Tests

Run all tests:
```bash
cd backend
pytest
```

Run tests with coverage:
```bash
pytest --cov=src --cov-report=html
```

Run specific test file:
```bash
pytest tests/test_chat.py
```

Run tests with verbose output:
```bash
pytest -v
```

## Architecture Overview

### Key Files

- `src/main.py` - FastAPI application entry point
- `src/db.py` - Database connection and initialization
- `src/models/` - SQLModel entity definitions
- `src/services/` - Business logic implementations
- `src/routes/chat.py` - Chat endpoint implementation
- `src/agents/todo_agent.py` - AI Agent implementation using third-party agents library with Google Gemini API
- `src/mcp_server/tools.py` - MCP tools for task operations
- `src/middleware/auth.py` - Authentication middleware

### Request Flow

1. Client sends message to `/api/{user_id}/chat`
2. Authentication middleware validates JWT
3. Chat endpoint retrieves conversation history from database
4. OpenAI Agent processes message with MCP tools context
5. Agent executes appropriate MCP tools (add_task, list_tasks, etc.)
6. Tools update database with new tasks/messages
7. Agent generates response based on tool results
8. Response is returned to client with conversation_id and tool_calls

## User Isolation & Security

### Critical Rules

- User ID is extracted from JWT token, never from request body
- All database queries are scoped by user_id
- Users can only access their own tasks and conversations
- MCP tools validate user ownership before operations

### Security Checks

Verify these security measures:
```python
# Example from auth middleware
def require_user(token: str = Security(oauth2_scheme)):
    user_data = decode_jwt(token)
    user_id = user_data.get("sub")  # Always from JWT, never from request
    return user_id
```

```python
# Example from task service
async def get_user_tasks(session: AsyncSession, user_id: str):
    statement = select(Task).where(Task.user_id == user_id)  # Scoped to user
    result = await session.execute(statement)
    return result.scalars().all()
```

## Database Queries

### Example Queries

**Get user's tasks**:
```python
from sqlmodel import select
from src.models.task import Task

statement = select(Task).where(Task.user_id == user_id)
result = await session.execute(statement)
tasks = result.scalars().all()
```

**Create a new conversation**:
```python
from src.models.conversation import Conversation

conversation = Conversation(user_id=user_id)
session.add(conversation)
await session.commit()
await session.refresh(conversation)
```

**Add message to conversation**:
```python
from src.models.message import Message

message = Message(
    user_id=user_id,
    conversation_id=conversation_id,
    role="user",
    content=user_message
)
session.add(message)
await session.commit()
```

## Troubleshooting

### Common Issues

**Issue**: Database connection fails
**Solution**: Verify DATABASE_URL in environment variables and ensure PostgreSQL server is running

**Issue**: JWT authentication fails
**Solution**: Check BETTER_AUTH_SECRET and ensure token is properly formatted

**Issue**: MCP server not responding
**Solution**: Verify MCP server is running and properly configured

**Issue**: OpenAI API errors
**Solution**: Check OPENAI_API_KEY and API quota limits

**Issue**: Chat endpoint returns 404
**Solution**: Ensure the endpoint path is `/api/{user_id}/chat` with correct user_id

### Debugging Tips

Enable debug logging:
```
LOG_LEVEL=DEBUG
```

Check database connectivity:
```bash
python -c "from src.db import engine; print(engine.url)"
```

Verify JWT token:
```bash
python -c "from jose import jwt; print(jwt.decode('YOUR_TOKEN', 'YOUR_SECRET', algorithms=['HS256']))"
```

## Performance Optimization

### Response Time Goals

- Chat endpoint: <3 seconds
- Database queries: <500ms
- MCP tool calls: <1 second each

### Monitoring

Monitor these metrics:
- Average response time
- Error rates
- Database query performance
- MCP server availability

## Useful Commands

### Development
```bash
# Format code
black src/
ruff check src/

# Type check
mypy src/

# Shell access
python -i -c "from src.db import get_session; session = next(get_session())"
```

### Database
```bash
# Reset database (development only)
python -c "from src.db import reset_db; reset_db()"

# Seed with test data
python -c "from src.db import seed_test_data; seed_test_data()"
```

### MCP Server
```bash
# Start MCP server separately
python -m src.mcp_server
```

## Next Steps

1. Complete the full implementation following the spec
2. Add comprehensive tests
3. Deploy backend to cloud provider
4. Configure OpenAI ChatKit domain allowlist
5. Deploy frontend to Vercel
6. Test end-to-end functionality