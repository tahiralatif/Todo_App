# Feature Specification: Phase-2 Backend Evolution

**Feature Branch**: `001-backend-evolution`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "Backend Specifications — Phase 2 Overview This document defines the complete backend specifications for Phase-2..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Task Management (Priority: P1)

As a registered user, I want to securely create and view my own tasks so that I can manage my to-do list without others seeing or modifying my data.

**Why this priority**: Core functionality that delivers the basic value of the application with multi-user isolation.

**Independent Test**: Can be tested by creating a user, authenticating, creating a task, and verifying that only the authenticated user can retrieve that task via the list endpoint.

**Acceptance Scenarios**:

1. **Given** a valid authentication token, **When** I POST a task with a title and description, **Then** the task is created and linked to my user ID.
2. **Given** a valid authentication token, **When** I GET my tasks, **Then** I receive a list containing only the tasks associated with my user ID.
3. **Given** an invalid or missing token, **When** I attempt to access task endpoints, **Then** I receive a 401 Unauthorized error.

---

### User Story 2 - Task Updates and Completion (Priority: P2)

As a user, I want to update my tasks and mark them as complete so that I can track my progress accurately.

**Why this priority**: Essential for the "evolution" of the task lifecycle beyond simple creation.

**Independent Test**: Can be tested by updating an existing task's title or description and toggling the completion status with a PATCH request, then verifying the changes via a GET request.

**Acceptance Scenarios**:

1. **Given** a task I own, **When** I PUT/PATCH an update to the title or description, **Then** the task record is updated and the `updated_at` timestamp changes.
2. **Given** a task I own, **When** I PATCH the completion status to `true`, **Then** the task is marked as completed in the system.
3. **Given** a task owned by another user, **When** I attempt to update or mark it complete, **Then** I receive a 403 Forbidden error.

---

### User Story 3 - Task Deletion (Priority: P3)

As a user, I want to delete tasks I no longer need so that my task list remains clean and relevant.

**Why this priority**: Lifecycle completion that allows for data cleanup.

**Independent Test**: Can be tested by deleting a specific task ID and verifying with a GET request that the task no longer exists.

**Acceptance Scenarios**:

1. **Given** a task I own, **When** I DELETE the task, **Then** it is permanently removed from my list.
2. **Given** a task owned by another user, **When** I attempt to delete it, **Then** I receive a 403 Forbidden error.

---

## Authentication Responsibility Model

- Frontend uses Better Auth for user authentication UI and session handling.
- Backend is the **source of truth for authorization**.
- Backend MUST:
  - Verify JWT signature
  - Validate token expiry
  - Extract user_id from JWT `sub` claim
- Backend MUST NOT trust any user_id sent from frontend request body or URL.


## Edge Cases

- **Duplicate User Registration**: What happens when a user attempts to sign up with an email that is already registered? (Expected: 409 Conflict)
- **Token Expiry**: How does the system handle a request with an expired JWT? (Expected: 401 Unauthorized)
- **Invalid UUID**: What happens when a request targets a task ID that is not a valid UUID format? (Expected: 422 Validation Error)
- **Concurrency**: How does the system handle simultaneous updates to the same task? (Expected: Standard database locking/last-write-wins)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST delegate user signup/login to Better Auth (frontend responsibility). Backend does NOT store or validate passwords.
- **FR-002**: System MUST verify JWT tokens issued by Better Auth on all task-related endpoints.
- **FR-003**: System MUST extract user_id from JWT `sub` claim for all authenticated requests.
- **FR-004**: System MUST create a User record on-demand when a valid JWT `sub` is used in an API request for the first time (lazy creation).
- **FR-005**: System MUST enforce strict user isolation (users can only access/modify their own tasks).
- **FR-006**: System MUST support CRUD operations (Create, Read, Update, Delete) for tasks.
- **FR-007**: System MUST support toggling task completion status via a PATCH endpoint.
- **FR-008**: System MUST validate that task titles are between 1 and 200 characters.
- **FR-009**: System MUST return all authenticated user's tasks without filtering, pagination, or sorting (Phase-2 MVP).

### Key Entities *(include if feature involves data)*

- **User**: Represents a registered person. Attributes: ID (UUID), Email (Unique, from Better Auth), Created At. **Note**: Password storage and validation are entirely managed by Better Auth; backend does not store passwords.
- **Task**: Represents a to-do item. Attributes: ID (UUID), User ID (Foreign Key), Title, Description, Is Completed (Boolean), Created At, Updated At.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of task access attempts without a valid token result in a 401/403 error.
- **SC-002**: 100% of database queries for tasks are scoped by user ID to prevent data leakage.
- **SC-003**: API response time for task retrieval remains under 1 second for lists of up to 100 tasks.
- **SC-004**: System successfully handles concurrent task operations from different users without data corruption.

## Implementation Constraints (Technical Foundation)

### Folder Structure (Backend)

```
backend/
├── src/
│   ├── main.py
│   ├── db.py
│   ├── models/
│   │   ├── user.py
│   │   └── task.py
│   ├── services/
│   │   ├── auth_service.py
│   │   └── task_service.py
│   ├── routes/
│   │   ├── auth.py
│   │   └── tasks.py
│   ├── middleware/
│   │   ├── auth.py
│   │   └── errors.py
│   └── schemas/
│       ├── auth.py
│       └── task.py
├── tests/
│   ├── test_auth.py
│   └── test_tasks.py
└── pyproject.toml
```

### Architectural Rules

- **Routes**: Thin layer that handles HTTP only; no business logic.
- **Services**: Thick layer containing all domain logic and validation.
- **Models**: ORM representations only; no business logic.
- **Middleware**: Authentication verification and error handling.

### Data Models (ORM Specifications)

#### User Entity (SQLModel)

- **id** (UUID, Primary Key)
- **email** (String, Unique, Indexed)
- **created_at** (DateTime, Default: current timestamp)
- Password handling abstracted via authentication provider (Better Auth)

#### Task Entity (SQLModel)

- **id** (UUID, Primary Key)
- **user_id** (UUID, Foreign Key → users.id, Indexed, NOT NULL)
- **title** (String, Max 200 chars, NOT NULL)
- **description** (String, Optional, Max 1000 chars)
- **completed** (Boolean, Default: false, Indexed)
- **created_at** (DateTime, Default: current timestamp)
- **updated_at** (DateTime, Default: current timestamp, Updated on every mutation)

### API Endpoint Specifications

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/signup | Register new user | No |
| POST | /api/auth/signin | Authenticate user and issue JWT | No |

#### Task Endpoints (JWT Required)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/tasks | List authenticated user's tasks | Yes |
| POST | /api/tasks | Create new task for authenticated user | Yes |
| GET | /api/tasks/{task_id} | Retrieve specific task (must be owned by user) | Yes |
| PUT | /api/tasks/{task_id} | Update task (full replacement) | Yes |
| PATCH | /api/tasks/{task_id} | Update task (partial update) | Yes |
| PATCH | /api/tasks/{task_id}/complete | Toggle task completion status | Yes |
| DELETE | /api/tasks/{task_id} | Delete task (must be owned by user) | Yes |

### Request/Response Format

#### Success Response (200, 201)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "completed": false,
    "created_at": "2026-01-08T10:30:00Z",
    "updated_at": "2026-01-08T10:30:00Z"
  },
  "message": "Operation successful"
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
| FORBIDDEN | 403 | Valid JWT but insufficient permissions (e.g., accessing another user's task) |
| VALIDATION_ERROR | 422 | Invalid input (bad UUID, title too long, etc.) |
| RESOURCE_NOT_FOUND | 404 | Task or user does not exist |
| CONFLICT | 409 | Resource already exists (e.g., duplicate email) |
| INTERNAL_ERROR | 500 | Server-side error |

### Authorization Rules (Non-Negotiable)

- Backend MUST NOT trust user_id from request body or query parameters.
- Backend MUST extract user_id ONLY from JWT `sub` claim.
- Every task query MUST be scoped to the authenticated user.
- Any cross-user access attempt MUST return 403 Forbidden.

### Validation Rules

- **Title**: Required, min 1 character, max 200 characters.
- **Description**: Optional, max 1000 characters.
- **UUID**: Invalid UUIDs return 422 Validation Error.
- **Email**: Must be unique per user (409 Conflict if duplicate on signup).

### Concurrency Strategy

- **Last-Write-Wins**: No optimistic locking in Phase-2.
- **updated_at Requirement**: MUST be updated on every mutation (POST, PUT, PATCH, DELETE).

### Testing Requirements

All tests MUST be automated using pytest and cover:

- **Authentication**: Valid token accepted, invalid/expired token rejected.
- **CRUD Operations**: Create, read, update, delete tasks.
- **User Isolation**: Users can only access their own tasks.
- **Forbidden Access**: Cross-user access returns 403.
- **Edge Cases**: Duplicate registration, invalid UUIDs, concurrency.

## Clarifications

### Session 2026-01-08

- Q: Should backend delegate ALL authentication to Better Auth or store/validate passwords? → A: Backend delegates ALL authentication. Frontend handles signup/signin via Better Auth. Backend verifies JWT only.
- Q: Should GET /api/tasks support filtering, pagination, or sorting? → A: Phase-2 MVP: No filtering/pagination. GET /api/tasks returns all user tasks (max 100 per SC-003).
- Q: When is the User record created in backend: at signup or on first API request? → A: Lazy creation. User record created on first API request (when JWT `sub` is first used).

## Assumptions

- **JWT Expiry**: JWT tokens default to 24-hour expiry unless otherwise specified.
- **Persistence**: Data persisted in PostgreSQL via SQLModel ORM (Neon provider).
- **Service Layer**: All business logic encapsulated in dedicated service classes.
- **Modular Design**: Code organized by responsibility (routes, services, models, middleware).
- **No Manual Code**: All implementation driven by spec via Claude Code.
- **Authentication Delegation**: Backend does NOT store passwords. Better Auth owns credential validation and password hashing. Backend verifies JWT signature and expiry only.
- **User Lazy Creation**: User records created on-demand when JWT `sub` claim is first used in an API request (e.g., first task creation).
- **Query Parameters**: Phase-2 MVP provides no query parameter filtering, pagination, or sorting on GET /api/tasks.
