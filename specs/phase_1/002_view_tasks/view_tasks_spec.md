# View Tasks Specification

## Phase I — In-Memory Todo Console Application

---

## Feature Overview

This specification defines the **View Tasks** feature, allowing users to see all existing todo tasks in a structured, readable CLI format.

---

## User Intent

As a user,
I want to view all my tasks,
so that I can see what needs to be done and what is already completed.

---

## Functional Requirements

- The system must display all existing tasks.
- Tasks must be fetched from in-memory storage.
- If no tasks exist, the user must be informed clearly.

---

## CLI Interaction Flow

- User selects **"View Tasks"** from the menu using Questionary.
- Tasks are rendered using **Rich tables**.

### Display Format

Each task must show:
- ID
- Title
- Description (if available)
- Completion status

---

## UI Requirements (Rich)

- Completed tasks must be visually distinct (e.g., green text or checkmark).
- Incomplete tasks must be visually clear (e.g., yellow or pending icon).
- Table headers must be styled.

---

## Empty State Handling

- If no tasks exist:
  - Display a friendly message using Rich
  - Do not crash or show raw output

---

## Acceptance Criteria

- [ ] User can view all tasks
- [ ] Tasks are displayed in a table
- [ ] Empty task list is handled gracefully
- [ ] No manual code edits required

---

## Dependencies

- `rich`
- In-memory task store
