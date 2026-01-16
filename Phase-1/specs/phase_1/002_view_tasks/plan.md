# Implementation Plan: View Tasks

**Feature:** 002_view_tasks
**Date:** 2026-01-01
**Spec:** view_tasks_spec.md

---

## Summary

Design the View Tasks feature for the Phase I CLI Todo application. This feature displays all tasks in a formatted table using Rich, with visual distinction for completed vs pending tasks.

---

## Technical Context

**Language/Version:** Python 3.13+
**Primary Dependencies:** rich
**Storage:** In-memory (TaskManager singleton)
**Testing:** pytest (recommended)
**Target Platform:** CLI (terminal)

---

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| OOP Design | ✅ | Uses Task entity, TaskManager service |
| Rich Tables | ✅ | Displaying tasks in Rich table format |

---

## Project Structure

```
src/
├── models/
│   └── task.py          # Task entity (shared)
├── services/
│   └── task_manager.py  # TaskService (shared)
├── ui/
│   └── cli_controller.py  # View tasks method
└── main.py

tests/
└── test_task_manager.py
```

---

## Architecture Decisions

### Table Display Format

**Decision:** Rich Table with columns: ID, Title, Description, Status

**Rationale:**
- Clear visual hierarchy
- Easy to scan task list
- Status column shows completion state

### Status Visualization

| Status | Visual |
|--------|--------|
| Pending | Yellow text / ⏳ icon |
| Completed | Green text / ✅ icon |

---

## Data Flow

```
User selects "View Tasks"
         ↓
CLI Controller.view_tasks()
         ↓
TaskManager.get_all_tasks()
         ↓
Rich Table.render(tasks)
         ↓
Console output
```

---

## Class Design

### CLIController (ui/cli_controller.py)

```python
class CLIController:
    def view_tasks(self) -> None:
        """Display all tasks in a Rich table."""
        tasks = self._task_manager.get_all_tasks()
        if not tasks:
            console.print(Panel("No tasks yet!", style="yellow"))
        else:
            table = Table()
            table.add_column("ID", style="cyan")
            table.add_column("Title", style="magenta")
            table.add_column("Description")
            table.add_column("Status")
            for task in tasks:
                status = "[green]✅[/green]" if task.completed else "[yellow]⏳[/yellow]"
                table.add_row(str(task.id), task.title, task.description or "", status)
            console.print(table)
```

---

## Error Scenarios

| Scenario | Handling |
|----------|----------|
| No tasks | Friendly "No tasks yet" panel |
| Empty store | Same as above |

---

**Plan Generated:** 2026-01-01
**Feature:** View Tasks (002_view_tasks)
**Status:** Ready for /sp.tasks
