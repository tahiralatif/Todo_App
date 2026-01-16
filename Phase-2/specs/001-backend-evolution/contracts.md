# API Contracts: Phase-2 Backend Evolution

**Feature**: `001-backend-evolution` | **Date**: 2026-01-08 | **Spec**: `spec.md`

## Overview

This document defines the REST API contract for the Phase-2 Todo application backend. All endpoints follow consistent JSON response format and error handling patterns. Authentication is via JWT tokens issued by Better Auth.

---

## Base Configuration

**Base URL**: `/api`
**Protocol**: HTTPS (production) / HTTP (development)
**Version**: v1 (implicit, may be versioned in future)
**Content-Type**: `application/json`

### Authentication Header

All task-related endpoints (marked **Auth Required: Yes**) require:

```
Authorization: Bearer <jwt_token>
```

The JWT token is issued by Better Auth and contains:
- `sub` claim: User ID (UUID string)
- `exp` claim: Token expiry (Unix timestamp)
- `iat` claim: Token issued-at (Unix timestamp)

Backend MUST verify signature and expiry before processing.

---

## Response Format

### Success Response (2xx)

```json
{
  "success": true,
  "data": {
    // Response payload specific to endpoint
  },
  "message": "Operation successful"
}
```

### Error Response (4xx, 5xx)

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable error message",
    "details": {
      "field": "optional",
      "constraint": "optional"
    }
  }
}
```

---

## Endpoints

### Authentication Endpoints

#### 1. POST /api/auth/signup

**Purpose**: Register a new user (Frontend responsibility, backend may handle acknowledgment)

**Auth Required**: No

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (201 Created)**:

```json
{
  "success": true,
  "data": {
    "id": "user_uuid",
    "email": "user@example.com",
    "created_at": "2026-01-08T10:30:00Z"
  },
  "message": "User created successfully"
}
```

**Errors**:

- **409 Conflict** (CONFLICT): Email already registered
  ```json
  {
    "success": false,
    "error": {
      "code": "CONFLICT",
      "message": "Email already registered"
    }
  }
  ```

- **422 Validation Error** (VALIDATION_ERROR): Invalid email or password format
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Invalid email format",
      "details": {"field": "email"}
    }
  }
  ```

**Note**: Backend delegates actual credential validation to Better Auth. This endpoint primarily acknowledges signup and creates User record if needed.

---

#### 2. POST /api/auth/signin

**Purpose**: Authenticate user and obtain JWT token

**Auth Required**: No

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_uuid",
      "email": "user@example.com",
      "created_at": "2026-01-08T10:30:00Z"
    }
  },
  "message": "Sign in successful"
}
```

**Errors**:

- **401 Unauthorized** (INVALID_TOKEN): Invalid credentials
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_TOKEN",
      "message": "Invalid email or password"
    }
  }
  ```

- **422 Validation Error** (VALIDATION_ERROR): Missing required fields
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Email and password are required"
    }
  }
  ```

**Note**: Better Auth generates JWT; backend validates and returns to frontend.

---

### Task Endpoints

#### 3. GET /api/tasks

**Purpose**: List all tasks for authenticated user

**Auth Required**: Yes

**Query Parameters**: None (Phase-2 MVP: no filtering/pagination/sorting)

**Response (200 OK)**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "user_uuid",
      "title": "Complete Phase II",
      "description": "Implement backend API",
      "completed": false,
      "created_at": "2026-01-08T10:30:00Z",
      "updated_at": "2026-01-08T10:30:00Z"
    },
    {
      "id": 2,
      "user_id": "user_uuid",
      "title": "Review code",
      "description": null,
      "completed": true,
      "created_at": "2026-01-08T09:00:00Z",
      "updated_at": "2026-01-08T11:15:00Z"
    }
  ],
  "message": "Tasks retrieved successfully"
}
```

**Errors**:

- **401 Unauthorized** (AUTH_REQUIRED): Missing JWT token
- **401 Unauthorized** (INVALID_TOKEN): Expired or malformed JWT
- **500 Internal Error** (INTERNAL_ERROR): Database query failure

**Performance Note**: Response time MUST be <1 second for max 100 tasks (SC-003).

---

#### 4. POST /api/tasks

**Purpose**: Create new task for authenticated user

**Auth Required**: Yes

**Request Body**:

```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}
```

**Response (201 Created)**:

```json
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": "user_uuid",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false,
    "created_at": "2026-01-08T12:00:00Z",
    "updated_at": "2026-01-08T12:00:00Z"
  },
  "message": "Task created successfully"
}
```

**Errors**:

- **401 Unauthorized** (AUTH_REQUIRED): Missing JWT token
- **422 Validation Error** (VALIDATION_ERROR): Invalid title/description
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Title must be between 1-200 characters",
      "details": {"field": "title", "constraint": "length"}
    }
  }
  ```

**User Isolation**: `user_id` extracted from JWT `sub` claim; never from request body.

---

#### 5. GET /api/tasks/{task_id}

**Purpose**: Retrieve specific task (must be owned by authenticated user)

**Auth Required**: Yes

**Path Parameters**:
- `task_id` (integer): Task ID to retrieve

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user_uuid",
    "title": "Complete Phase II",
    "description": "Implement backend API",
    "completed": false,
    "created_at": "2026-01-08T10:30:00Z",
    "updated_at": "2026-01-08T10:30:00Z"
  },
  "message": "Task retrieved successfully"
}
```

**Errors**:

- **401 Unauthorized** (AUTH_REQUIRED / INVALID_TOKEN): Missing or invalid JWT
- **403 Forbidden** (FORBIDDEN): Task belongs to different user
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "You do not have permission to access this task"
    }
  }
  ```

- **404 Not Found** (RESOURCE_NOT_FOUND): Task does not exist
  ```json
  {
    "success": false,
    "error": {
      "code": "RESOURCE_NOT_FOUND",
      "message": "Task not found"
    }
  }
  ```

- **422 Validation Error** (VALIDATION_ERROR): Invalid task_id format

---

#### 6. PUT /api/tasks/{task_id}

**Purpose**: Full update (replace) of task

**Auth Required**: Yes

**Path Parameters**:
- `task_id` (integer): Task ID to update

**Request Body** (all fields required for full replacement):

```json
{
  "title": "Complete Phase II Backend",
  "description": "Implement all endpoints",
  "completed": false
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user_uuid",
    "title": "Complete Phase II Backend",
    "description": "Implement all endpoints",
    "completed": false,
    "created_at": "2026-01-08T10:30:00Z",
    "updated_at": "2026-01-08T13:45:00Z"
  },
  "message": "Task updated successfully"
}
```

**Errors**:

- **401 Unauthorized** (AUTH_REQUIRED / INVALID_TOKEN)
- **403 Forbidden** (FORBIDDEN): Task belongs to different user
- **404 Not Found** (RESOURCE_NOT_FOUND): Task does not exist
- **422 Validation Error** (VALIDATION_ERROR): Invalid field values

**User Isolation**: `user_id` extracted from JWT; task ownership verified before update.

---

#### 7. PATCH /api/tasks/{task_id}

**Purpose**: Partial update of task

**Auth Required**: Yes

**Path Parameters**:
- `task_id` (integer): Task ID to update

**Request Body** (all fields optional):

```json
{
  "title": "Updated title only"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user_uuid",
    "title": "Updated title only",
    "description": "Implement backend API",
    "completed": false,
    "created_at": "2026-01-08T10:30:00Z",
    "updated_at": "2026-01-08T14:00:00Z"
  },
  "message": "Task updated successfully"
}
```

**Errors**: Same as PUT endpoint.

**Difference from PUT**: Only provided fields are updated; omitted fields retain current values.

---

#### 8. PATCH /api/tasks/{task_id}/complete

**Purpose**: Toggle task completion status

**Auth Required**: Yes

**Path Parameters**:
- `task_id` (integer): Task ID to toggle

**Request Body**:

```json
{
  "completed": true
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "user_uuid",
    "title": "Complete Phase II",
    "description": "Implement backend API",
    "completed": true,
    "created_at": "2026-01-08T10:30:00Z",
    "updated_at": "2026-01-08T14:15:00Z"
  },
  "message": "Task marked as completed"
}
```

**Errors**: Same as GET endpoint (401, 403, 404, 422).

---

#### 9. DELETE /api/tasks/{task_id}

**Purpose**: Delete task (must be owned by authenticated user)

**Auth Required**: Yes

**Path Parameters**:
- `task_id` (integer): Task ID to delete

**Response (204 No Content)**:

```
(empty body)
```

Or alternatively (200 OK):

```json
{
  "success": true,
  "data": null,
  "message": "Task deleted successfully"
}
```

**Errors**:

- **401 Unauthorized** (AUTH_REQUIRED / INVALID_TOKEN)
- **403 Forbidden** (FORBIDDEN): Task belongs to different user
- **404 Not Found** (RESOURCE_NOT_FOUND): Task does not exist

**Concurrency Note**: Last-Write-Wins; no conflict detection in Phase II.

---

## HTTP Status Code Mapping

| Status | Code | Scenario |
|--------|------|----------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource creation) |
| 204 | No Content | Successful DELETE (empty response) |
| 400 | Bad Request | Malformed request (rarely used; prefer 422) |
| 401 | Unauthorized | AUTH_REQUIRED, INVALID_TOKEN |
| 403 | Forbidden | FORBIDDEN (cross-user access) |
| 404 | Not Found | RESOURCE_NOT_FOUND |
| 409 | Conflict | CONFLICT (duplicate email) |
| 422 | Unprocessable Entity | VALIDATION_ERROR (invalid input) |
| 500 | Internal Server Error | INTERNAL_ERROR (server bug) |

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Missing JWT token |
| INVALID_TOKEN | 401 | Malformed, expired, or invalid JWT |
| FORBIDDEN | 403 | Valid JWT but insufficient permissions (cross-user access) |
| RESOURCE_NOT_FOUND | 404 | Task or user does not exist |
| VALIDATION_ERROR | 422 | Invalid input (bad UUID, title too long, missing field) |
| CONFLICT | 409 | Resource already exists (duplicate email) |
| INTERNAL_ERROR | 500 | Server-side error |

---

## Concurrency & Collision Handling

**Strategy**: Last-Write-Wins (no optimistic locking)

If two clients update the same task simultaneously:
- Both requests succeed
- The last write overwrites previous changes
- `updated_at` timestamp reflects last modification

**Future Enhancement** (Phase III): Add ETag or version field for optimistic locking.

---

## Rate Limiting

**Phase II**: Not implemented.
**Future**: Consider adding rate limiting (e.g., 100 req/min per user) if needed.

---

## CORS Configuration

Backend MUST configure CORS to allow frontend origin only:

```python
# backend/src/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Notes

- All timestamps are UTC (ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`)
- Task IDs are integers (auto-increment); User IDs are UUID strings
- Frontend MUST handle 401/403 errors by redirecting to login/auth flow
- Backend MUST NOT trust user_id from request body or query parameters
