# Implementation Plan: Phase-2 Backend Evolution

**Branch**: `001-backend-evolution` | **Date**: 2026-01-08 | **Spec**: `specs/001-backend-evolution/spec.md`
**Input**: Feature specification from `/specs/001-backend-evolution/spec.md`

**Note**: This plan details the technical architecture for the FastAPI backend implementing multi-user task management with JWT authentication, Neon PostgreSQL persistence, and comprehensive REST API endpoints.

## Summary

Implement a FastAPI-based REST API backend for the Phase-2 Todo application providing secure task management with JWT-based authentication, multi-user data isolation, and persistent storage via Neon PostgreSQL using SQLModel ORM. The backend will support three core user stories: secure task management (P1), task updates and completion (P2), and task deletion (P3). Architecture follows service-oriented design with thin HTTP routing layer, thick business logic service layer, and modular middleware for authentication and error handling.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI, SQLModel, Pydantic, Better Auth (JWT verification), pytest
**Storage**: Neon PostgreSQL (serverless), SQLModel ORM for schema and queries
**Testing**: pytest with async support, unit tests, integration tests, API contract tests
**Target Platform**: Linux server (FastAPI ASGI application)
**Project Type**: Backend API (web service)
**Performance Goals**: <1 second p95 for task retrieval (max 100 tasks per SC-003), 100% JWT verification success rate
**Constraints**: All task queries MUST be scoped by user_id; cross-user access returns 403; token expiry validation required; last-write-wins concurrency strategy
**Scale/Scope**: Phase-2 MVP: multi-user support, 7 task endpoints + 2 auth endpoints, CRUD operations, lazy user creation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Non-Negotiable Rules Verification:**
- ✅ Spec-Driven Development: Feature specification in `/specs/001-backend-evolution/spec.md` complete with all functional requirements, user stories, acceptance criteria, and technical constraints documented.
- ✅ AI-Assisted Implementation: Code generation via Claude Code with specification-driven approach (no manual coding without spec).
- ✅ Feature Isolation: Development in `001-backend-evolution` branch with isolated spec, plan, and tasks artifacts.
- ✅ Phase Isolation: Phase II API architecture distinct from Phase I CLI; reuses domain logic patterns only.
- ✅ Technology Stack: Python 3.13+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth JWT verification align with constitution v0.3.0.
- ✅ Backend-First Design: REST API with versioned endpoints, consistent JSON response structure, no shared state with frontend.
- ✅ Object-Oriented Architecture: Service layer encapsulation, clear routing/services/models/middleware separation.
- ✅ Security First: JWT authentication on all task endpoints, user data isolation at query level, environment variables for secrets, CORS configured.

**Gate Status**: ✅ PASS - All constitution requirements satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
│   │   └── task.py             # Task SQLModel entity (adapted from Phase I)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py     # Authentication service (JWT verification)
│   │   └── task_service.py     # Task business logic (CRUD, validation, user scoping)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py             # POST /api/auth/signup, /api/auth/signin endpoints
│   │   └── tasks.py            # Task CRUD endpoints (GET, POST, PUT, PATCH, DELETE)
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py             # JWT verification and user_id extraction middleware
│   │   └── errors.py           # Global error handling and response formatting
│   └── schemas/
│       ├── __init__.py
│       ├── auth.py             # Pydantic models for auth requests/responses
│       └── task.py             # Pydantic models for task requests/responses
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # pytest fixtures and test database configuration
│   ├── test_auth.py            # Authentication endpoint tests
│   ├── test_tasks.py           # Task endpoint tests
│   ├── test_user_isolation.py  # Cross-user access prevention tests
│   └── test_edge_cases.py      # Edge cases (invalid UUID, expiry, concurrency)
├── .env.example                # Environment variables template
├── pyproject.toml              # Python project metadata and dependencies
├── uv.lock                     # Dependency lock file (uv package manager)
└── README.md                   # Backend setup and usage instructions
```

**Structure Decision**: Web application architecture (Phase-2 monorepo) with backend API isolated from frontend. Backend follows three-tier service architecture: routing layer (thin HTTP handling) → services layer (thick business logic) → models layer (ORM entities). Middleware layer handles cross-cutting concerns (JWT auth, error handling). This structure supports Phase II requirements and enables future Phase III expansion (AI chatbot) and Phase IV (Kubernetes deployment).

## Complexity Tracking

> **Gate passes with no violations. Complexity tracking not required.**

N/A - All architectural decisions align with constitution and are justified by specification requirements.

---

## Phase 0: Outline & Research

**Status**: ✅ Complete - No clarifications required. All technical decisions resolved by specification and constitution.

### Research Findings

**Decision 1: Authentication Architecture**
- **Choice**: Backend delegates ALL authentication to Better Auth; verifies JWT only.
- **Rationale**: Separation of concerns simplifies backend; Better Auth manages credential validation, hashing, expiry. Backend responsibility limited to signature verification and user_id extraction from JWT `sub` claim.
- **Alternatives Considered**: Full backend authentication (rejected: increases complexity, duplicates Better Auth functionality); SSO delegation (rejected: out of scope for Phase II)

**Decision 2: Database Persistence**
- **Choice**: Neon PostgreSQL with SQLModel ORM (async SQLAlchemy + Pydantic).
- **Rationale**: Aligns with constitution; serverless PostgreSQL reduces infrastructure overhead; SQLModel provides type safety and ORM abstraction without heavy migration tooling.
- **Alternatives Considered**: MongoDB (rejected: not in tech stack); in-memory (rejected: violates Phase II multi-user persistence requirement)

**Decision 3: User Record Lifecycle**
- **Choice**: Lazy creation pattern. User records created on-demand when JWT `sub` is first used in an API request.
- **Rationale**: Simplifies signup flow (no backend signup endpoint); defers user creation until first API interaction. Aligns with stateless JWT verification model.
- **Alternatives Considered**: Eager creation at signup (rejected: requires synchronous frontend→backend coordination); on-first-task-creation (rejected: too late; other operations should also trigger creation)

**Decision 4: Error Handling & Response Format**
- **Choice**: Standardized JSON response envelope with success/error fields and HTTP status codes mapped to error codes.
- **Rationale**: Consistent API contract for frontend; enables typed response handling; clear error categorization (4xx validation, 401 auth, 403 authorization, 5xx server).
- **Alternatives Considered**: Exception-only responses (rejected: inconsistent; frontend needs structured error info)

**Decision 5: User Isolation & Authorization**
- **Choice**: Database query scoping + endpoint-level validation. Every task query filtered by user_id extracted from JWT `sub`.
- **Rationale**: Defense-in-depth; query-level isolation prevents accidental data leakage; endpoint validation catches cross-user access attempts early.
- **Alternatives Considered**: Role-based access control (rejected: overkill for Phase II single-role system)

**Decision 6: Testing Strategy**
- **Choice**: Pytest with fixture-based test database, separate test suites for auth, tasks, user isolation, edge cases.
- **Rationale**: Async-compatible; enables fast test execution; isolates concerns for clarity and maintainability.
- **Alternatives Considered**: FastAPI TestClient only (rejected: insufficient coverage for service layer); manual integration testing (rejected: not scalable)

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete - Data model, API contracts, and quickstart generated.

### 1.1 Data Model (`data-model.md`)

Comprehensive schema design covering:
- **User Entity**: UUID ID, email (unique), created_at timestamp
- **Task Entity**: Integer ID, user_id (FK), title (1-200 chars), description (0-1000), completed (bool), timestamps
- **Relationships**: One-to-Many (User → Tasks), ON DELETE CASCADE
- **Indexes**: user_id (fast filtering), completed (future sorting)
- **Lazy Creation Pattern**: User records created on-demand when JWT `sub` first used
- **Validation Rules**: Title required, description optional, email uniqueness, UUID format
- **State Transitions**: Created → Updated/Completed → Deleted lifecycle
- **SQLModel Definitions**: Type-safe ORM with Pydantic + SQLAlchemy
- **Database Schema**: SQL DDL statements for PostgreSQL
- **Error Scenarios**: 9 error cases mapped to HTTP status + error codes

### 1.2 API Contracts (`contracts.md`)

Complete REST API specification including:
- **9 Endpoints**: 2 auth (signup, signin) + 7 task operations (GET list, POST create, GET single, PUT full, PATCH partial, PATCH complete, DELETE)
- **Response Format**: Standardized JSON envelope with success/data/message fields
- **Error Format**: Error responses with code, message, optional details
- **Authentication**: JWT Bearer token in Authorization header
- **Status Codes**: 200, 201, 204, 401, 403, 404, 409, 422, 500 mapped to error codes
- **User Isolation**: Every endpoint enforces user_id verification
- **Request/Response Examples**: JSON payloads for each endpoint
- **Concurrency Strategy**: Last-Write-Wins, `updated_at` tracking
- **CORS Configuration**: Allow frontend origin only
- **Rate Limiting**: Not implemented (Phase II)

### 1.3 Quickstart Guide (`quickstart.md`)

Developer-ready setup and reference guide:
- **Environment Setup**: Prerequisites, structure, virtual env
- **Local Development**: Installation, .env configuration, database init
- **Running Application**: Dev/prod servers, API docs endpoints
- **Testing API**: curl examples for all 9 endpoints
- **Unit/Integration Tests**: pytest commands, test files, coverage
- **Architecture Overview**: Request flow, key files
- **User Isolation & Security**: JWT verification flow, critical rules
- **Database Queries**: Code examples for user/task queries
- **Troubleshooting**: Common issues and solutions
- **Performance Optimization**: Response time goals, techniques, monitoring
- **Useful Commands**: Format, lint, type check, shell access

### 1.4 Constitution Check (Re-evaluation)

Post-design validation:
- ✅ **Spec-Driven Development**: All phase 1 outputs driven by specification
- ✅ **AI-Assisted Implementation**: Ready for Claude Code implementation phase
- ✅ **Feature Isolation**: All artifacts isolated in 001-backend-evolution spec directory
- ✅ **Phase Isolation**: Backend API architecture distinct from Phase I CLI
- ✅ **Non-Negotiable Rules**: All constitution rules addressed
- ✅ **Database Schema**: Aligns with constitution v0.3.0 (SQLModel, Neon PostgreSQL)
- ✅ **API Standards**: RESTful JSON endpoints with consistent response format
- ✅ **Authentication**: JWT verification pattern defined, Better Auth delegation clear
- ✅ **Security**: User isolation at query level, no client-side user_id trust

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
   - Lazy user creation service
   - Auth endpoint stubs

3. **Data Models** (2 tasks):
   - User SQLModel implementation
   - Task SQLModel implementation

4. **Services & Business Logic** (3-4 tasks):
   - Auth service (JWT verification, user creation)
   - Task service (CRUD, validation, user isolation)
   - Error handling and response formatting

5. **API Endpoints** (2-3 tasks):
   - Auth routes (signup, signin)
   - Task routes (GET list, POST, GET single, PUT, PATCH, PATCH complete, DELETE)
   - Request/response validation with Pydantic schemas

6. **Testing** (4-5 tasks):
   - Auth tests (valid/invalid tokens)
   - Task CRUD tests
   - User isolation tests
   - Edge case tests (invalid UUIDs, expiry, concurrency)
   - Test database fixtures

7. **Documentation & DevOps** (2 tasks):
   - Backend README.md
   - Deployment configuration (if Phase II includes deployment)

**Estimated Scope**: 22-30 implementation tasks total
**Prerequisites**: All Phase 1 design documents complete and understood
