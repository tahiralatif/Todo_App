# Feature Specification: Phase-3 AI Chatbot

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Phase III: Todo AI Chatbot - Create an AI-powered chatbot interface for managing todos through natural language using MCP (Model Context Protocol) server architecture."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Natural Language Task Management (Priority: P1)

As a user, I want to manage my tasks using natural language conversations so that I can interact with my todo list in a more intuitive way without clicking buttons.

**Why this priority**: Core functionality that delivers the AI chatbot value proposition.

**Independent Test**: Can be tested by sending a natural language message like "Add a task to buy groceries" and verifying that a task is created in the database.

**Acceptance Scenarios**:

1. **Given** a user sends "Add a task to buy groceries", **When** the AI processes the message, **Then** a new task titled "buy groceries" is created in the database.
2. **Given** a user sends "Show me all my tasks", **When** the AI processes the message, **Then** the AI responds with a list of all tasks.
3. **Given** a user sends "Mark task 3 as complete", **When** the AI processes the message, **Then** task 3 is marked as completed in the database.

---

### User Story 2 - Conversation State Management (Priority: P2)

As a user, I want my conversation with the AI to maintain context so that I can have meaningful ongoing interactions.

**Why this priority**: Essential for a good user experience where the AI remembers previous interactions.

**Independent Test**: Can be tested by having a multi-turn conversation and verifying that the conversation history is preserved in the database.

**Acceptance Scenarios**:

1. **Given** a user starts a conversation, **When** messages are exchanged, **Then** all messages are stored in the database with conversation context.
2. **Given** a conversation exists in the database, **When** the user resumes chatting, **Then** the AI can reference previous messages in the conversation.

---

### User Story 3 - MCP Tool Integration (Priority: P3)

As a developer, I want the AI to use MCP tools for task operations so that there's a standardized interface between the AI and the application.

**Why this priority**: Critical for the architecture and scalability of the system.

**Independent Test**: Can be tested by verifying that AI agent calls MCP tools for task operations rather than directly accessing the database.

**Acceptance Scenarios**:

1. **Given** a user wants to add a task, **When** the AI processes the request, **Then** the AI calls the `add_task` MCP tool.
2. **Given** a user wants to list tasks, **When** the AI processes the request, **Then** the AI calls the `list_tasks` MCP tool.

---

## Authentication Responsibility Model

- Frontend uses Better Auth for user authentication.
- Backend is the **source of truth for authorization**.
- Backend MUST:
  - Verify JWT signature from Better Auth
  - Validate token expiry
  - Extract user_id from JWT claims
- Backend MUST NOT trust any user_id sent from frontend request body or URL.

## Edge Cases

- **Invalid Natural Language**: What happens when a user sends unclear instructions? (Expected: AI asks for clarification)
- **Token Expiry**: How does the system handle a request with an expired JWT? (Expected: 401 Unauthorized)
- **Task Not Found**: What happens when a user refers to a non-existent task? (Expected: AI responds with helpful error message)
- **MCP Server Down**: How does the system handle MCP server unavailability? (Expected: Graceful degradation with error message)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a conversational interface for task management using natural language.
- **FR-002**: System MUST use third-party agents library with Google Gemini API through OpenAI-compatible endpoint for AI logic and conversation processing.
- **FR-003**: System MUST implement MCP server with official MCP SDK exposing task operations as tools.
- **FR-004**: System MUST maintain conversation state in the database (stateless server architecture).
- **FR-005**: System MUST support all basic task operations: add, list, complete, delete, update.
- **FR-006**: System MUST authenticate users via Better Auth and extract user_id from JWT.
- **FR-007**: System MUST validate that users can only access their own tasks and conversations.
- **FR-008**: System MUST handle natural language variations for task operations.
- **FR-009**: System MUST provide helpful responses and error handling.

### Key Entities *(include if feature involves data)*

- **Task**: Represents a to-do item. Attributes: ID, User ID (Foreign Key), Title, Description, Is Completed (Boolean), Created At, Updated At.
- **Conversation**: Represents a chat session. Attributes: ID, User ID (Foreign Key), Created At, Updated At.
- **Message**: Represents a chat message. Attributes: ID, User ID (Foreign Key), Conversation ID (Foreign Key), Role (user/assistant), Content, Created At.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of natural language commands result in appropriate MCP tool calls.
- **SC-002**: 100% of conversation history is preserved in the database.
- **SC-003**: API response time for chat requests remains under 3 seconds.
- **SC-004**: System successfully handles concurrent conversations from different users without data corruption.
- **SC-005**: AI correctly interprets at least 90% of common natural language commands.

## Implementation Constraints (Technical Foundation)

### Folder Structure (Backend)

```
backend/
├── src/
│   ├── main.py
│   ├── db.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── conversation.py
│   │   └── message.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── task_service.py
│   │   ├── conversation_service.py
│   │   └── mcp_service.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── chat.py
│   │   └── mcp.py
│   ├── agents/
│   │   ├── __init__.py
│   │   └── todo_agent.py
│   ├── mcp_server/
│   │   ├── __init__.py
│   │   └── tools.py
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py
│       └── errors.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_chat.py
│   ├── test_mcp_tools.py
│   └── test_agents.py
└── pyproject.toml
```

### Architectural Rules

- **Routes**: Thin layer that handles HTTP only; no business logic.
- **Services**: Thick layer containing all domain logic and validation.
- **Models**: ORM representations only; no business logic.
- **Agents**: AI logic and conversation processing.
- **MCP Server**: Tool definitions for AI to interact with the application.
- **Middleware**: Authentication verification and error handling.

### Data Models (SQLModel)

#### User Entity (SQLModel)

- **id** (UUID, Primary Key)
- **email** (String, Unique, Indexed)
- **created_at** (DateTime, Default: current timestamp)

#### Task Entity (SQLModel)

- **id** (Integer, Primary Key)
- **user_id** (UUID, Foreign Key → users.id, Indexed, NOT NULL)
- **title** (String, Max 200 chars, NOT NULL)
- **description** (String, Optional, Max 1000 chars)
- **completed** (Boolean, Default: false, Indexed)
- **created_at** (DateTime, Default: current timestamp)
- **updated_at** (DateTime, Default: current timestamp, Updated on every mutation)

#### Conversation Entity (SQLModel)

- **id** (Integer, Primary Key)
- **user_id** (UUID, Foreign Key → users.id, Indexed, NOT NULL)
- **created_at** (DateTime, Default: current timestamp)
- **updated_at** (DateTime, Default: current timestamp, Updated on every message)

#### Message Entity (SQLModel)

- **id** (Integer, Primary Key)
- **user_id** (UUID, Foreign Key → users.id, Indexed, NOT NULL)
- **conversation_id** (Integer, Foreign Key → conversations.id, Indexed, NOT NULL)
- **role** (String, Enum: "user"/"assistant", NOT NULL)
- **content** (Text, NOT NULL)
- **created_at** (DateTime, Default: current timestamp)

### API Endpoint Specifications

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/signup | Register new user | No |
| POST | /api/auth/signin | Authenticate user and issue JWT | No |

#### Chat Endpoint (JWT Required)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/chat | Send message and get AI response | Yes |

### Request/Response Format

#### Chat Success Response (200)

```json
{
  "conversation_id": 123,
  "response": "I've added the task 'Buy groceries' to your list.",
  "tool_calls": [
    {
      "name": "add_task",
      "arguments": {"user_id": "abc123", "title": "Buy groceries"},
      "result": {"task_id": 456, "status": "created", "title": "Buy groceries"}
    }
  ]
}
```

#### Error Response (4xx, 5xx)

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable error message"
  }
}
```

### Error Codes & HTTP Status Mapping

| Error Code | HTTP Status | Scenario |
|------------|-------------|----------|
| AUTH_REQUIRED | 401 | Missing JWT token |
| INVALID_TOKEN | 401 | Malformed or expired JWT |
| FORBIDDEN | 403 | Valid JWT but insufficient permissions |
| VALIDATION_ERROR | 422 | Invalid input (malformed request) |
| INTERNAL_ERROR | 500 | Server-side error |
| MCP_UNAVAILABLE | 503 | MCP server unavailable |

### Authorization Rules (Non-Negotiable)

- Backend MUST NOT trust user_id from request body or query parameters.
- Backend MUST extract user_id ONLY from JWT claims.
- Every task and conversation query MUST be scoped to the authenticated user.
- Any cross-user access attempt MUST return 403 Forbidden.

### Validation Rules

- **Message Content**: Required, min 1 character, max 1000 characters.
- **User ID**: Must be valid UUID from JWT claims.
- **Conversation ID**: Optional for new conversations, validated if provided.
- **Task Operations**: MCP tools validate user_id matches task owner.

### Concurrency Strategy

- **Stateless Architecture**: No server-side conversation state maintained.
- **Database Locking**: Rely on database transaction isolation for concurrent access.

### Testing Requirements

All tests MUST be automated using pytest and cover:

- **Authentication**: Valid token accepted, invalid/expired token rejected.
- **Chat Operations**: Natural language processing and MCP tool calls.
- **User Isolation**: Users can only access their own conversations and tasks.
- **Forbidden Access**: Cross-user access returns 403.
- **Edge Cases**: Invalid natural language, MCP server down, token expiry.

## Clarifications

### Session 2026-02-07

- Q: Should the server maintain conversation state in memory or use database? → A: Stateless architecture - conversation state maintained in database only.
- Q: How should MCP tools handle user authentication? → A: MCP tools receive user_id from AI agent and validate against task ownership.
- Q: What natural language commands should be supported? → A: Add, list, complete, delete, update tasks as specified in requirements.

## Assumptions

- **JWT Expiry**: JWT tokens default to 24-hour expiry unless otherwise specified.
- **Persistence**: Data persisted in PostgreSQL via SQLModel ORM (Neon provider).
- **Service Layer**: All business logic encapsulated in dedicated service classes.
- **Modular Design**: Code organized by responsibility (routes, services, models, agents, mcp).
- **No Manual Code**: All implementation driven by spec via Claude Code.
- **Authentication Delegation**: Backend verifies JWT signature and expiry only.
- **MCP Standard**: MCP tools follow official MCP SDK specifications.
- **OpenAI Integration**: Uses OpenAI Agents SDK for conversation processing.
- **ChatKit Frontend**: Frontend uses OpenAI ChatKit for user interface.