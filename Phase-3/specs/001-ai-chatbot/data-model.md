# Data Model: Phase-3 AI Chatbot

**Specification**: `specs/001-ai-chatbot/spec.md` | **Date**: 2026-02-07

## Overview

This document defines the database schema for the Phase-3 AI Chatbot application, including entities for user management, task management, conversation tracking, and message history. The schema uses SQLModel (Pydantic + SQLAlchemy) for type safety and ORM capabilities.

## Entity Relationships

```
User (1) -----> (Many) Task
User (1) -----> (Many) Conversation  
User (1) -----> (Many) Message
Conversation (1) -----> (Many) Message
```

## Detailed Entity Definitions

### User Entity

**Table Name**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, INDEX, NOT NULL | User's email address (from Better Auth) |
| created_at | TIMESTAMP | DEFAULT NOW(), NOT NULL | Timestamp when user record was created |

**Notes**:
- Password management delegated to Better Auth
- Email uniqueness enforced at database level
- Index on email for fast lookups

### Task Entity

**Table Name**: `tasks`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for the task |
| user_id | UUID | FOREIGN KEY(users.id), INDEX, NOT NULL | Reference to owning user |
| title | VARCHAR(200) | NOT NULL | Task title (1-200 characters) |
| description | TEXT | NULL | Optional task description (max 1000 characters) |
| completed | BOOLEAN | DEFAULT FALSE, INDEX | Completion status |
| created_at | TIMESTAMP | DEFAULT NOW(), NOT NULL | Timestamp when task was created |
| updated_at | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW(), NOT NULL | Timestamp when task was last updated |

**Notes**:
- Foreign key constraint ensures referential integrity
- Index on user_id for efficient user-specific queries
- Index on completed for filtering completed/pending tasks
- updated_at automatically updated on any modification

### Conversation Entity

**Table Name**: `conversations`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for the conversation |
| user_id | UUID | FOREIGN KEY(users.id), INDEX, NOT NULL | Reference to owning user |
| created_at | TIMESTAMP | DEFAULT NOW(), NOT NULL | Timestamp when conversation was started |
| updated_at | TIMESTAMP | DEFAULT NOW(), ON UPDATE NOW(), NOT NULL | Timestamp when conversation was last updated |

**Notes**:
- Foreign key constraint ensures referential integrity
- Index on user_id for efficient user-specific queries
- updated_at automatically updated when messages are added

### Message Entity

**Table Name**: `messages`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for the message |
| user_id | UUID | FOREIGN KEY(users.id), INDEX, NOT NULL | Reference to owning user |
| conversation_id | INTEGER | FOREIGN KEY(conversations.id), INDEX, NOT NULL | Reference to parent conversation |
| role | VARCHAR(20) | ENUM('user','assistant'), NOT NULL | Message sender role |
| content | TEXT | NOT NULL | Message content |
| created_at | TIMESTAMP | DEFAULT NOW(), NOT NULL | Timestamp when message was created |

**Notes**:
- Foreign key constraints ensure referential integrity
- Index on user_id for efficient user-specific queries
- Index on conversation_id for efficient conversation-specific queries
- Role restricted to 'user' or 'assistant'

## SQL Schema Definition

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index on email for fast lookups
CREATE INDEX idx_users_email ON users(email);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
```

## Relationship Constraints

- **ON DELETE CASCADE**: When a user is deleted, all their tasks, conversations, and messages are automatically deleted
- **ON DELETE CASCADE**: When a conversation is deleted, all its messages are automatically deleted
- **Referential Integrity**: Foreign key constraints ensure data consistency

## Indexing Strategy

- **Primary indexes**: On all primary key columns (auto-created)
- **User-specific queries**: Index on user_id for tasks, conversations, and messages
- **Task filtering**: Index on completed column for filtering completed/pending tasks
- **Conversation queries**: Index on conversation_id for message lookups
- **Role-based queries**: Index on role for filtering user/assistant messages

## Validation Rules

### Task Validation
- **Title**: Required, 1-200 characters
- **Description**: Optional, 0-1000 characters
- **Completed**: Boolean, defaults to false

### Message Validation
- **Content**: Required, minimum 1 character
- **Role**: Must be either 'user' or 'assistant'
- **User/Conversation Links**: Must reference valid user and conversation

### Conversation Validation
- **User Link**: Must reference valid user

## Error Scenarios

| Error Case | Error Code | HTTP Status | Description |
|------------|------------|-------------|-------------|
| Invalid User ID | INVALID_USER_ID | 400 | Provided user_id is not a valid UUID |
| Task Title Too Short | TITLE_TOO_SHORT | 422 | Task title is less than 1 character |
| Task Title Too Long | TITLE_TOO_LONG | 422 | Task title exceeds 200 characters |
| Task Description Too Long | DESC_TOO_LONG | 422 | Task description exceeds 1000 characters |
| Invalid Role | INVALID_ROLE | 422 | Message role is not 'user' or 'assistant' |
| User Not Found | USER_NOT_FOUND | 404 | Referenced user does not exist |
| Task Not Found | TASK_NOT_FOUND | 404 | Referenced task does not exist |
| Conversation Not Found | CONV_NOT_FOUND | 404 | Referenced conversation does not exist |
| Message Not Found | MSG_NOT_FOUND | 404 | Referenced message does not exist |
| Unauthorized Access | FORBIDDEN | 403 | User attempting to access resources owned by another user |

## Performance Considerations

- **Index Coverage**: All commonly queried fields are indexed
- **Foreign Key Constraints**: Ensure data integrity without significant performance impact
- **Timestamps**: Automatically managed by database triggers
- **Cascade Deletes**: Efficiently maintain referential integrity

## Migration Path

This schema represents the initial Phase-3 structure. Future phases may add:
- Task categories/tags
- Due dates and reminders
- File attachments to messages
- Enhanced user profiles