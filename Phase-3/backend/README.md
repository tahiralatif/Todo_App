# AI Todo Chatbot Backend

This is the backend for the AI-powered todo chatbot application. It provides a natural language interface for managing tasks using Google Gemini AI through an OpenAI-compatible endpoint.

## Features

- Natural language task management via AI chatbot
- MCP (Model Context Protocol) server for standardized AI-tool interaction
- User authentication and isolation
- Conversation history management
- Task CRUD operations with completion tracking

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLModel ORM
- **AI Integration**: Third-party agents library with Google Gemini API
- **Authentication**: JWT-based with Better Auth integration
- **MCP Server**: Official MCP SDK for tool integration

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Todo_App/Phase-3/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install uv  # or use your preferred package manager
uv sync  # or pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret for JWT verification
- `GEMINI_API_KEY`: Google Gemini API key for AI functionality
- `SUPABASE_URL`: (Optional) Supabase URL for file storage
- `SUPABASE_ANON_KEY`: (Optional) Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: (Optional) Supabase service role key
- `DEBUG`: Enable/disable debug mode (default: false)

## Running the Application

```bash
# Run the development server
uv run uvicorn src.main:app --reload --port 8000

# Or using the main script
python -m src.main
```

The application will be available at `http://localhost:8000`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/signin` - Login and get JWT token
- `POST /api/auth/logout` - Logout user

### Chat
- `POST /api/{user_id}/chat` - Chat with the AI assistant

### Health Check
- `GET /health` - Check application health

## Architecture

The application follows a service-oriented architecture:

- **Routes**: Handle HTTP requests and responses
- **Services**: Contain business logic and validation
- **Models**: Define database schemas using SQLModel
- **Middleware**: Handle authentication and error handling
- **Agents**: AI logic using third-party agents library
- **MCP Server**: Tools for AI to interact with the application

## Testing

Run the test suite:

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_chat.py
```

## Database Migrations

The application uses SQLModel which handles automatic schema creation. No manual migrations are needed for basic setup.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT