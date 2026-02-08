# API Contracts: Phase-3 AI Chatbot

**Specification**: `specs/001-ai-chatbot/spec.md` | **Date**: 2026-02-07

## Overview

This document defines the API contracts for the Phase-3 AI Chatbot application, including endpoint specifications, request/response formats, authentication requirements, and error handling patterns.

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Token is obtained via the `/api/auth/signin` endpoint and validated on all protected endpoints.

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup

Register a new user with Better Auth.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User created successfully"
}
```

**Error Response (409)**:
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "User with this email already exists"
  }
}
```

#### POST /api/auth/signin

Authenticate user and issue JWT tokens.

**Request**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Authentication successful"
}
```

**Error Response (401)**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### Chat Endpoint

#### POST /api/{user_id}/chat

Send a message to the AI chatbot and receive a response with MCP tool calls.

**Authentication Required**: Yes

**Path Parameter**:
- `user_id` (string): The ID of the user making the request (extracted from JWT)

**Request**:
```json
{
  "conversation_id": 123,
  "message": "Add a task to buy groceries"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "conversation_id": 123,
    "response": "I've added the task 'Buy groceries' to your list.",
    "tool_calls": [
      {
        "name": "add_task",
        "arguments": {
          "user_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "title": "Buy groceries",
          "description": null
        },
        "result": {
          "task_id": 456,
          "status": "created",
          "title": "Buy groceries"
        }
      }
    ]
  },
  "message": "Message processed successfully"
}
```

**Request without conversation_id (new conversation)**:
```json
{
  "message": "Show me all my tasks"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "conversation_id": 124,
    "response": "Here are all your tasks:\n1. Buy groceries (pending)\n2. Call mom (pending)",
    "tool_calls": [
      {
        "name": "list_tasks",
        "arguments": {
          "user_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "status": "all"
        },
        "result": [
          {
            "id": 456,
            "title": "Buy groceries",
            "description": null,
            "completed": false
          },
          {
            "id": 457,
            "title": "Call mom",
            "description": "Schedule appointment",
            "completed": false
          }
        ]
      }
    ]
  },
  "message": "Message processed successfully"
}
```

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

## Error Codes & HTTP Status Mapping

| Error Code | HTTP Status | Scenario |
|------------|-------------|----------|
| AUTH_REQUIRED | 401 | Missing JWT token |
| INVALID_TOKEN | 401 | Malformed or expired JWT |
| FORBIDDEN | 403 | Valid JWT but insufficient permissions (e.g., accessing another user's tasks) |
| VALIDATION_ERROR | 422 | Invalid input (bad request format, invalid data) |
| RESOURCE_NOT_FOUND | 404 | Resource (task, conversation, etc.) does not exist |
| CONFLICT | 409 | Resource already exists (e.g., duplicate email) |
| INTERNAL_ERROR | 500 | Server-side error |
| MCP_UNAVAILABLE | 503 | MCP server unavailable |

## Authorization Rules

- All endpoints except `/api/auth/signup` and `/api/auth/signin` require authentication
- User ID is extracted from JWT token, not from request body
- Users can only access their own resources (tasks, conversations, messages)
- MCP tools validate that operations are performed on user-owned resources

## Request Validation

### Chat Request Validation
- **message**: Required, min 1 character, max 1000 characters
- **conversation_id**: Optional integer, validated if provided

### Authentication Request Validation
- **email**: Required, valid email format
- **password**: Required, min 8 characters
- **name**: Required for signup, min 1 character, max 100 characters

## Rate Limiting

Not implemented in Phase-3 MVP.

## CORS Policy

- Allowed origins: Frontend domain (configured in environment)
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization
- Credentials allowed: Yes

## Response Headers

- `Content-Type`: application/json
- `Cache-Control`: no-cache (for authenticated endpoints)
- `Access-Control-Allow-Credentials`: true (when applicable)

## Example cURL Requests

### Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Signin
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Chat
```bash
curl -X POST http://localhost:8000/api/a1b2c3d4-e5f6-7890-1234-567890abcdef/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -d '{
    "message": "Add a task to buy groceries"
  }'
```

## Versioning

API versioning will be implemented in future phases using URI versioning (e.g., `/api/v1/chat`) or header-based versioning.

## Security Considerations

- JWT tokens are signed and validated server-side
- User IDs are extracted from JWT claims, not request body
- All database queries are scoped by user ID
- Input validation prevents injection attacks
- Rate limiting to be implemented in future phases