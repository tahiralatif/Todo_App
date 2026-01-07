# Delete Task Specification

## Phase I — In-Memory Todo Console Application

---

## Feature Overview

This feature enables users to delete a task permanently from memory.

---

## User Intent

As a user,
I want to delete a task,
so that I can remove things I no longer need.

---

## Functional Requirements

- User must delete a task using its **ID**.
- System must confirm deletion before proceeding.
- Deleted tasks must be removed from memory.

---

## CLI Interaction Flow

1. User selects **"Delete Task"**
2. User enters task ID
3. System asks for confirmation (Yes / No)
4. If confirmed:
   - Task is deleted
5. If cancelled:
   - No changes occur

---

## UI Requirements

- Confirmation prompt via Questionary
- Success and cancellation messages via Rich

---

## Error Handling

- Invalid ID:
  - Show error
  - Do not crash
- Deleting non-existent task is forbidden

---

## Acceptance Criteria

- [ ] Task deletion works correctly
- [ ] Confirmation is required
- [ ] Invalid IDs handled safely
- [ ] In-memory state updates correctly

---

## Dependencies

- `rich`
- `questionary`
