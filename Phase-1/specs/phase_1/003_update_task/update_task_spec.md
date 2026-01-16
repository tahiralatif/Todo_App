# Update Task Specification

## Phase I — In-Memory Todo Console Application

---

## Feature Overview

This feature allows a user to update the **title and/or description** of an existing task.

---

## User Intent

As a user,
I want to update an existing task,
so that I can correct or improve its details.

---

## Functional Requirements

- User must select a task by **ID**.
- System must validate task existence.
- User may update:
  - Title
  - Description
- Empty updates must not overwrite existing values.

---

## CLI Interaction Flow

1. User selects **"Update Task"**.
2. User is prompted to enter task ID.
3. If task exists:
   - Prompt for new title (optional)
   - Prompt for new description (optional)
4. Changes are applied in memory.

---

## UI Requirements

- Use Rich for:
  - Error messages (invalid ID)
  - Confirmation of successful update
- Updated values must be displayed after change.

---

## Error Handling

- Invalid ID:
  - Show error
  - Return user safely to menu
- Empty title input:
  - Must not overwrite existing title

---

## Acceptance Criteria

- [ ] Task can be updated by ID
- [ ] Invalid IDs are handled
- [ ] Partial updates work correctly
- [ ] Success feedback is shown

---

## Dependencies

- `rich`
- `questionary`
