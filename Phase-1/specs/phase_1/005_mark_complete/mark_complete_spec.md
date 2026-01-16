# Mark Task as Complete Specification

## Phase I — In-Memory Todo Console Application

---

## Feature Overview

This feature allows a user to mark an existing task as **completed**, updating its status in memory without deleting it.

---

## User Intent

As a user,
I want to mark a task as complete,
so that I can track my progress and finished work.

---

## Functional Requirements

- User must select a task using its **ID**.
- Task must exist in memory.
- Task status must change from **Pending → Completed**.
- Already completed tasks must not be re-marked.

---

## CLI Interaction Flow

1. User selects **"Mark Task as Complete"** from menu.
2. User enters task ID.
3. System validates:
   - Task exists
   - Task is not already completed
4. Task status is updated in memory.
5. Success confirmation is shown.

---

## UI Requirements (Rich)

- Completed task must show:
  - ✅ icon
  - Green colored status text
- If task already completed:
  - Show warning message
- Confirmation message must be styled

---

## Error Handling

- Invalid ID:
  - Error message
  - Safe return to menu
- Task already completed:
  - No state change

---

## Acceptance Criteria

- [ ] Task can be marked complete
- [ ] Already completed tasks are handled safely
- [ ] UI reflects updated status
- [ ] No manual code edits

---

## Dependencies

- `rich`
- `questionary`
