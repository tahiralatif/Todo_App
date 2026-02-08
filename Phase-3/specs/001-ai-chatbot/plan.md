# Implementation Plan: Phase-3 AI Chatbot

**Branch**: `001-ai-chatbot` | **Date**: 2026-02-07 | **Spec**: `specs/001-ai-chatbot/spec.md`
**Input**: Feature specification from `/specs/001-ai-chatbot/spec.md`

**Note**: This plan details the technical architecture for the FastAPI backend implementing an AI-powered chatbot for task management with MCP (Model Context Protocol) server, Neon PostgreSQL persistence, and third-party agents library with Google Gemini API integration.

## Summary

Implement a FastAPI-based REST API backend for the Phase-3 Todo AI Chatbot application providing natural language task management with third-party agents library and Google Gemini API, MCP server architecture, multi-user data isolation, and persistent storage via Neon PostgreSQL using SQLModel ORM. The backend will support conversational task management through natural language processing, MCP tool integration, and stateless conversation handling. Architecture follows service-oriented design with thin HTTP routing layer, thick business logic service layer, AI agent layer, MCP server layer, and modular middleware for authentication and error handling.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI, SQLModel, Pydantic, Better Auth (JWT verification), agents library with Google Gemini API, Official MCP SDK, pytest
**Storage**: Neon PostgreSQL (serverless), SQLModel ORM for schema and queries
**Testing**: pytest with async support, unit tests, integration tests, API contract tests
**Target Platform**: Linux server (FastAPI ASGI application)
**Project Type**: Backend API (web service) with MCP server
**Performance Goals**: <3 second response time for chat requests, 90%+ accuracy in natural language command interpretation
**Constraints**: All data queries MUST be scoped by user_id; cross-user access returns 403; token expiry validation required; stateless server architecture with database persistence
**Scale/Scope**: Phase-3 MVP: AI chatbot, MCP tools, natural language processing, conversation history, 1 chat endpoint + 2 auth endpoints, task operations via MCP tools

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Non-Negotiable Rules Verification:**
- ✅ Spec-Driven Development: Feature specification in `/specs/001-ai-chatbot/spec.md` complete with all functional requirements, user stories, acceptance criteria, and technical constraints documented.
- ✅ AI-Assisted Implementation: Code generation via Claude Code with specification-driven approach (no manual coding without spec).
- ✅ Feature Isolation: Development in `001-ai-chatbot` branch with isolated spec, plan, and tasks artifacts.
- ✅ Phase Isolation: Phase III AI chatbot architecture distinct from Phase I CLI and Phase II backend; reuses domain logic patterns only.
- ✅ Technology Stack: Python 3.13+, FastAPI, SQLModel, Neon PostgreSQL, agents library with Google Gemini API, MCP SDK align with constitution v0.3.0.
- ✅ Backend-First Design: REST API with versioned endpoints, consistent JSON response structure, no shared state with frontend.
- ✅ Object-Oriented Architecture: Service layer encapsulation, clear routing/services/models/agents/mcp separation.
- ✅ Security First: JWT authentication on all task endpoints, user data isolation at query level, environment variables for secrets, CORS configured.

**Gate Status**: ✅ PASS - All constitution requirements satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/[###-ai-chatbot]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                 # FastAPI application entry point
│   ├── db.py                   # Database connection and session management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py             # User SQLModel entity
│   │   ├── task.py             # Task SQLModel entity (adapted from Phase I/II)
│   │   ├── conversation.py     # Conversation SQLModel entity
│   │   └── message.py          # Message SQLModel entity
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py     # Authentication service (JWT verification)
│   │   ├── task_service.py     # Task business logic (CRUD, validation, user scoping)
│   │   ├── conversation_service.py # Conversation management (CRUD, user scoping)
│   │   └── mcp_service.py      # MCP server integration service
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py             # POST /api/auth/signup, /api/auth/signin endpoints
│   │   └── chat.py             # POST /api/chat endpoint for AI interactions
│   ├── agents/
│   │   ├── __init__.py
│   │   └── todo_agent.py       # OpenAI Agent implementation for task management
│   ├── mcp_server/
│   │   ├── __init__.py
│   │   └── tools.py            # MCP tools for task operations (add, list, complete, delete, update)
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py             # JWT verification and user_id extraction middleware
│   │   └── errors.py           # Global error handling and response formatting
│   └── config/
│       ├── __init__.py
│       └── settings.py         # Application settings and configuration
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # pytest fixtures and test database configuration
│   ├── test_chat.py            # Chat endpoint tests
│   ├── test_mcp_tools.py       # MCP tools functionality tests
│   ├── test_agents.py          # AI agent behavior tests
│   ├── test_conversations.py   # Conversation state management tests
│   └── test_user_isolation.py  # Cross-user access prevention tests
├── .env.example                # Environment variables template
├── pyproject.toml              # Python project metadata and dependencies
├── uv.lock                     # Dependency lock file (uv package manager)
└── README.md                   # Backend setup and usage instructions
```

**Structure Decision**: Web application architecture (Phase-3 monorepo) with backend API isolated from frontend. Backend follows four-tier service architecture: routing layer (thin HTTP handling) → agents layer (AI processing) → services layer (business logic) → models layer (ORM entities), with MCP server as a parallel service layer. Middleware layer handles cross-cutting concerns (JWT auth, error handling). This structure supports Phase III requirements and enables future expansion (advanced AI features) and Phase IV (Kubernetes deployment).

## Complexity Tracking

> **Gate passes with no violations. Complexity tracking not required.**

N/A - All architectural decisions align with constitution and are justified by specification requirements.

---

## Phase 0: Outline & Research

**Status**: ✅ Complete - No clarifications required. All technical decisions resolved by specification and constitution.

### Research Findings

**Decision 1: AI Architecture**
- **Choice**: Third-party agents library with Google Gemini API and MCP server for standardized AI-tool interaction.
- **Rationale**: MCP provides standardized interface between AI and application; third-party agents library with Google Gemini API offers robust conversation management through OpenAI-compatible endpoint; stateless server architecture enables scalability.
- **Alternatives Considered**: Direct API calls from AI (rejected: creates tight coupling); LangChain (rejected: adds complexity without clear benefits for this use case)

**Decision 2: Database Persistence**
- **Choice**: Neon PostgreSQL with SQLModel ORM (async SQLAlchemy + Pydantic).
- **Rationale**: Aligns with constitution; serverless PostgreSQL reduces infrastructure overhead; SQLModel provides type safety and ORM abstraction without heavy migration tooling.
- **Alternatives Considered**: MongoDB (rejected: not in tech stack); in-memory (rejected: violates multi-user persistence requirement)

**Decision 3: Conversation State Management**
- **Choice**: Stateless server with database-persisted conversation history.
- **Rationale**: Enables horizontal scaling; conversation state survives server restarts; allows conversation resumption from any server instance.
- **Alternatives Considered**: In-memory state (rejected: not scalable, lost on restart); Redis cache (rejected: adds infrastructure complexity for Phase III MVP)

**Decision 4: Error Handling & Response Format**
- **Choice**: Standardized JSON response envelope with success/error fields and HTTP status codes mapped to error codes.
- **Rationale**: Consistent API contract for frontend; enables typed response handling; clear error categorization (4xx validation, 401 auth, 403 authorization, 5xx server).
- **Alternatives Considered**: Exception-only responses (rejected: inconsistent; frontend needs structured error info)

**Decision 5: User Isolation & Authorization**
- **Choice**: Database query scoping + endpoint-level validation. Every task/query filtered by user_id extracted from JWT claims.
- **Rationale**: Defense-in-depth; query-level isolation prevents accidental data leakage; endpoint validation catches cross-user access attempts early.
- **Alternatives Considered**: Role-based access control (rejected: overkill for Phase III single-role system)

**Decision 6: MCP Tool Architecture**
- **Choice**: Official MCP SDK with standardized tools for task operations (add, list, complete, delete, update).
- **Rationale**: Standardizes AI-application interaction; enables tool composition; provides clear boundaries between AI logic and business logic.
- **Alternatives Considered**: Custom API calls from AI (rejected: creates tight coupling, harder to maintain)

**Decision 7: Testing Strategy**
- **Choice**: Pytest with fixture-based test database, separate test suites for auth, chat, MCP tools, agents, user isolation.
- **Rationale**: Async-compatible; enables fast test execution; isolates concerns for clarity and maintainability.
- **Alternatives Considered**: FastAPI TestClient only (rejected: insufficient coverage for service layer); manual integration testing (rejected: not scalable)

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete - Data model, API contracts, and quickstart generated.

### 1.1 Data Model (`data-model.md`)

Comprehensive schema design covering:
- **User Entity**: UUID ID, email (unique), created_at timestamp
- **Task Entity**: Integer ID, user_id (FK), title (1-200 chars), description (0-1000), completed (bool), timestamps
- **Conversation Entity**: Integer ID, user_id (FK), created_at, updated_at timestamps
- **Message Entity**: Integer ID, user_id (FK), conversation_id (FK), role (user/assistant), content, created_at
- **Relationships**: One-to-Many (User → Tasks), One-to-Many (User → Conversations), One-to-Many (Conversation → Messages)
- **Indexes**: user_id (fast filtering), conversation_id (message lookup), completed (task filtering)
- **Validation Rules**: Title required, content required, email uniqueness, UUID format
- **State Transitions**: Created → Updated/Completed → Deleted lifecycle for tasks; Created → Messages Added for conversations
- **SQLModel Definitions**: Type-safe ORM with Pydantic + SQLAlchemy
- **Database Schema**: SQL DDL statements for PostgreSQL
- **Error Scenarios**: 9 error cases mapped to HTTP status + error codes

### 1.2 API Contracts (`contracts.md`)

Complete REST API specification including:
- **3 Endpoints**: 2 auth (signup, signin) + 1 chat operation (POST /api/chat)
- **Response Format**: Standardized JSON envelope with conversation_id, response, tool_calls fields
- **Error Format**: Error responses with code, message, optional details
- **Authentication**: JWT Bearer token in Authorization header
- **Status Codes**: 200, 401, 403, 404, 422, 500, 503 mapped to error codes
- **User Isolation**: Every endpoint enforces user_id verification
- **Request/Response Examples**: JSON payloads for chat endpoint
- **Concurrency Strategy**: Stateless architecture, database transaction isolation
- **CORS Configuration**: Allow frontend origin only
- **Rate Limiting**: Not implemented (Phase III)

### 1.3 Quickstart Guide (`quickstart.md`)

Developer-ready setup and reference guide:
- **Environment Setup**: Prerequisites, structure, virtual env
- **Local Development**: Installation, .env configuration, database init
- **Running Application**: Dev/prod servers, API docs endpoints
- **Testing API**: curl examples for chat endpoint
- **Unit/Integration Tests**: pytest commands, test files, coverage
- **Architecture Overview**: Request flow, key files
- **User Isolation & Security**: JWT verification flow, critical rules
- **Database Queries**: Code examples for user/task/conversation/message queries
- **MCP Server Setup**: Configuration and testing
- **AI Agent Configuration**: OpenAI API setup and testing
- **Troubleshooting**: Common issues and solutions
- **Performance Optimization**: Response time goals, techniques, monitoring
- **Useful Commands**: Format, lint, type check, shell access

### 1.4 Constitution Check (Re-evaluation)

Post-design validation:
- ✅ **Spec-Driven Development**: All phase 1 outputs driven by specification
- ✅ **AI-Assisted Implementation**: Ready for Claude Code implementation phase
- ✅ **Feature Isolation**: All artifacts isolated in 001-ai-chatbot spec directory
- ✅ **Phase Isolation**: Backend API architecture distinct from Phase I CLI and Phase II backend
- ✅ **Non-Negotiable Rules**: All constitution rules addressed
- ✅ **Database Schema**: Aligns with constitution v0.3.0 (SQLModel, Neon PostgreSQL)
- ✅ **API Standards**: RESTful JSON endpoints with consistent response format
- ✅ **Authentication**: JWT verification pattern defined, Better Auth delegation clear
- ✅ **Security**: User isolation at query level, no client-side user_id trust
- ✅ **AI Integration**: MCP server architecture defined, third-party agents library with Google Gemini API integration clear

**Gate Status**: ✅ PASS - All constitution requirements satisfied post-design.

---

## Next Phase: Phase 2 Task Breakdown

**Recommendation**: Execute `/sp.tasks` command to generate implementation tasks:

1. **Backend Setup** (6-8 tasks):
   - Initialize FastAPI project, pyproject.toml, dependencies
   - Database connection setup, SQLModel initialization
   - Environment variables and configuration
   - CORS and middleware setup

2. **Authentication** (3-4 tasks):
   - JWT verification middleware
   - Better Auth secret configuration
   - Auth endpoint stubs

3. **Data Models** (4 tasks):
   - User SQLModel implementation
   - Task SQLModel implementation (adapted from Phase II)
   - Conversation SQLModel implementation
   - Message SQLModel implementation

4. **Services & Business Logic** (4-5 tasks):
   - Auth service (JWT verification)
   - Task service (CRUD, validation, user isolation)
   - Conversation service (CRUD, user isolation)
   - MCP service (integration layer)

5. **MCP Server** (3-4 tasks):
   - MCP server setup with Official MCP SDK
   - MCP tools implementation (add_task, list_tasks, complete_task, delete_task, update_task)
   - MCP tool validation and error handling

6. **AI Agent** (2-3 tasks):
   - OpenAI Agent setup with Agents SDK
   - Agent configuration for task management
   - Agent-MCP integration

7. **API Endpoints** (2 tasks):
   - Auth routes (signup, signin)
   - Chat route (POST /api/chat with conversation state management)

8. **Testing** (5-6 tasks):
   - Auth tests (valid/invalid tokens)
   - Chat endpoint tests
   - MCP tools functionality tests
   - AI agent behavior tests
   - User isolation tests
   - Edge case tests (invalid natural language, MCP server down, token expiry)

9. **Documentation & DevOps** (2 tasks):
   - Backend README.md
   - Deployment configuration (if Phase III includes deployment)

**Estimated Scope**: 30-38 implementation tasks total
**Prerequisites**: All Phase 1 design documents complete and understood