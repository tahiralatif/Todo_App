# Phase I Implementation Plan: Todo Console Application

**Phase:** I - In-Memory Todo Console Application
**Date:** 2026-01-01
**Spec:** spec.md (consolidated)
**Features:** 6

---

## Summary

This plan outlines the implementation architecture for the Phase I Todo Console Application. The application is a CLI-based todo manager built with Python 3.13+, using Rich for styled output and Questionary for interactive prompts.

---

## Technical Context

**Language/Version:** Python 3.13+
**Package Manager:** `uv`
**Primary Dependencies:**
- `rich` - Styled terminal output, tables, panels
- `questionary` - Interactive CLI prompts, menu selection
**Storage:** In-memory (Python list/dict)
**Testing:** pytest (recommended)
**Target Platform:** Terminal/CLI

---

## Constitution Check

### Gates (Must Pass)

| Gate | Status | Evidence |
|------|--------|----------|
| OOP Design | ✅ | Task entity, TaskManager service, CLIController |
| No Manual Coding | ✅ | All code via Claude Code |
| Spec-First Workflow | ✅ | All features have specs in specs/phase_1/ |
| Feature-Isolated | ✅ | Each feature in numbered folder |
| Rich/Questionary | ✅ | Required by all feature specs |
| Modular Structure | ✅ | Separate models/services/ui modules |

### Principles Verified

1. **Object-Oriented Design** - Task class, TaskManager service, CLI controller
2. **Modular & Scalable** - Clear module boundaries, single responsibility
3. **Senior-Level Code** - Type hints, docstrings, validation, defensive programming

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────┐
│              Todo CLI Application               │
├─────────────────────────────────────────────────┤
│  UI Layer (cli_controller.py)                   │
│  - Questionary prompts                          │
│  - Rich display                                 │
│  - Menu handling                                │
├─────────────────────────────────────────────────┤
│  Service Layer (task_manager.py)                │
│  - Business logic                               │
│  - Task CRUD operations                         │
│  - ID generation                                │
├─────────────────────────────────────────────────┤
│  Model Layer (task.py)                          │
│  - Task entity                                  │
│  - Data validation                              │
├─────────────────────────────────────────────────┤
│  In-Memory Storage (_tasks list)                │
│  - Python list                                  │
│  - Singleton TaskManager                        │
└─────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── __init__.py
├── main.py                    # Entry point, menu loop
├── models/
│   ├── __init__.py
│   └── task.py                # Task entity class
├── services/
│   ├── __init__.py
│   └── task_manager.py        # Task CRUD operations
└── ui/
    ├── __init__.py
    └── cli_controller.py      # CLI interactions

tests/
├── __init__.py
└── test_task_manager.py       # Unit tests

specs/
└── phase_1/
    ├── spec.md                # Consolidated spec
    ├── 001_add_task/
    │   ├── add_task_spec.md
    │   └── plan.md
    ├── 002_view_tasks/
    ├── 003_update_task/
    ├── 004_delete_task/
    ├── 005_mark_complete/
    └── 006_exit_app/
```

---

## Data Model

### Task Entity (models/task.py)

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Task:
    """Represents a single todo task."""
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: Optional[datetime] = None

    VALID_TITLE_LENGTH = (1, 100)
    VALID_DESCRIPTION_LENGTH = (0, 500)

    def __post_init__(self):
        """Validate after initialization."""
        self._validate()

    def _validate(self) -> None:
        """Validate task attributes."""
        if not self.VALID_TITLE_LENGTH[0] <= len(self.title) <= self.VALID_TITLE_LENGTH[1]:
            raise ValueError(f"Title must be {self.VALID_TITLE_LENGTH[0]}-{self.VALID_TITLE_LENGTH[1]} characters")
        if self.description is not None and len(self.description) > self.VALID_DESCRIPTION_LENGTH[1]:
            raise ValueError(f"Description must be max {self.VALID_DESCRIPTION_LENGTH[1]} characters")

    def update(self, title: Optional[str] = None, description: Optional[str] = None) -> None:
        """Update task fields if provided."""
        if title is not None and title.strip():
            self.title = title.strip()
        if description is not None:
            self.description = description.strip() if description.strip() else None
        self._validate()
```

### TaskManager Service (services/task_manager.py)

```python
from typing import Optional
from datetime import datetime


class TaskManager:
    """Manages in-memory task storage and operations."""

    _instance: Optional['TaskManager'] = None
    _next_id: int = 1
    _tasks: list[Task] = []

    def __new__(cls) -> 'TaskManager':
        """Singleton pattern for shared state."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        """Reset state (for testing)."""
        cls._instance = None
        cls._next_id = 1
        cls._tasks = []

    def create_task(self, title: str, description: Optional[str] = None) -> Task:
        """Create and store a new task."""
        task = Task(
            id=self._next_id,
            title=title.strip(),
            description=description.strip() if description else None,
            completed=False,
            created_at=datetime.now()
        )
        self._tasks.append(task)
        self._next_id += 1
        return task

    def get_all_tasks(self) -> list[Task]:
        """Return all tasks."""
        return self._tasks.copy()

    def get_task_by_id(self, id: int) -> Optional[Task]:
        """Retrieve task by ID."""
        for task in self._tasks:
            if task.id == id:
                return task
        return None

    def update_task(
        self,
        id: int,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> Task:
        """Update task fields. Only non-None values are updated."""
        task = self.get_task_by_id(id)
        if task is None:
            raise KeyError(f"Task {id} not found")
        task.update(title, description)
        return task

    def delete_task(self, id: int) -> None:
        """Delete task by ID."""
        task = self.get_task_by_id(id)
        if task is None:
            raise KeyError(f"Task {id} not found")
        self._tasks.remove(task)

    def mark_complete(self, id: int) -> Task:
        """Mark task as completed."""
        task = self.get_task_by_id(id)
        if task is None:
            raise KeyError(f"Task {id} not found")
        if task.completed:
            raise ValueError(f"Task {id} already completed")
        task.completed = True
        return task
```

### CLI Controller (ui/cli_controller.py)

```python
from typing import Optional
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box
import questionary

from services.task_manager import TaskManager


class CLIController:
    """Handles CLI interactions using Rich and Questionary."""

    def __init__(self):
        self._task_manager = TaskManager()
        self.console = Console()

    def _main_menu(self) -> str:
        """Display main menu and return selection."""
        return questionary.select(
            "What would you like to do?",
            choices=[
                "Add Task",
                "View Tasks",
                "Update Task",
                "Delete Task",
                "Mark Task as Complete",
                "Exit"
            ]
        ).ask()

    def add_task(self) -> None:
        """Interactive add task flow."""
        title = questionary.text("Task title:").ask()
        if not title or not title.strip():
            self.console.print(Panel("Title cannot be empty", style="red"))
            return

        description = questionary.text("Description (optional):").ask()

        task = self._task_manager.create_task(title, description)
        self.console.print(Panel(
            f"Task created successfully!\n\n"
            f"ID: {task.id}\n"
            f"Title: {task.title}\n"
            f"Description: {task.description or 'N/A'}",
            title="✅ Task Added",
            style="green"
        ))

    def view_tasks(self) -> None:
        """Display all tasks in a Rich table."""
        tasks = self._task_manager.get_all_tasks()

        if not tasks:
            self.console.print(Panel("No tasks yet! Add your first task.", style="yellow"))
            return

        table = Table(title="Your Tasks", box=box.ROUNDED)
        table.add_column("ID", style="cyan", width=4)
        table.add_column("Title", style="magenta")
        table.add_column("Description")
        table.add_column("Status", justify="center")

        for task in tasks:
            status = Text("✅", style="green") if task.completed else Text("⏳", style="yellow")
            table.add_row(
                str(task.id),
                task.title,
                task.description or "",
                status
            )

        self.console.print(table)

    def update_task(self) -> None:
        """Update an existing task."""
        task_id = questionary.text("Enter task ID to update:").ask()
        try:
            task_id = int(task_id)
        except ValueError:
            self.console.print(Panel("Invalid ID", style="red"))
            return

        task = self._task_manager.get_task_by_id(task_id)
        if task is None:
            self.console.print(Panel(f"Task {task_id} not found", style="red"))
            return

        new_title = questionary.text(f"New title (leave empty to keep '{task.title}'):").ask()
        new_desc = questionary.text(f"New description (leave empty to keep):").ask()

        self._task_manager.update_task(
            task_id,
            title=new_title if new_title.strip() else None,
            description=new_desc if new_desc.strip() else None
        )
        self.console.print(Panel(f"Task {task_id} updated", title="✅", style="green"))

    def delete_task(self) -> None:
        """Delete a task with confirmation."""
        task_id = questionary.text("Enter task ID to delete:").ask()
        try:
            task_id = int(task_id)
        except ValueError:
            self.console.print(Panel("Invalid ID", style="red"))
            return

        task = self._task_manager.get_task_by_id(task_id)
        if task is None:
            self.console.print(Panel(f"Task {task_id} not found", style="red"))
            return

        if questionary.confirm(f"Delete '{task.title}'?").ask():
            self._task_manager.delete_task(task_id)
            self.console.print(Panel(f"Task {task_id} deleted", title="✅", style="green"))
        else:
            self.console.print(Panel("Deletion cancelled", style="yellow"))

    def mark_complete(self) -> None:
        """Mark a task as complete."""
        task_id = questionary.text("Enter task ID to mark complete:").ask()
        try:
            task_id = int(task_id)
        except ValueError:
            self.console.print(Panel("Invalid ID", style="red"))
            return

        try:
            task = self._task_manager.mark_complete(task_id)
            self.console.print(Panel(
                f"Task {task_id} marked as complete!\n\n"
                f"Title: {task.title}",
                title="✅ Done",
                style="green"
            ))
        except KeyError:
            self.console.print(Panel(f"Task {task_id} not found", style="red"))
        except ValueError as e:
            self.console.print(Panel(str(e), style="yellow"))

    def run(self) -> None:
        """Main application loop."""
        while True:
            choice = self._main_menu()

            if choice == "Add Task":
                self.add_task()
            elif choice == "View Tasks":
                self.view_tasks()
            elif choice == "Update Task":
                self.update_task()
            elif choice == "Delete Task":
                self.delete_task()
            elif choice == "Mark Task as Complete":
                self.mark_complete()
            elif choice == "Exit":
                self.console.print(Panel("Goodbye! 👋", style="blue"))
                break
```

### Entry Point (main.py)

```python
from ui.cli_controller import CLIController


def main() -> None:
    """Application entry point."""
    controller = CLIController()
    controller.run()


if __name__ == "__main__":
    main()
```

---

## UI/UX Specifications

### Rich Styling

| Context | Style |
|---------|-------|
| Success | green Panel |
| Error | red Panel |
| Warning | yellow Panel |
| Task Table | Table with box.ROUNDED |
| Completed Status | ✅ green icon |
| Pending Status | ⏳ yellow icon |

### Questionary Usage

| Action | Method |
|--------|--------|
| Text input | `questionary.text()` |
| Confirmation | `questionary.confirm()` |
| Menu selection | `questionary.select()` |

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Empty title | Rich error + return to menu |
| Invalid ID | Rich error + safe return |
| Already completed | Rich warning |
| Delete non-existent | Rich error |
| Validation failure | ValueError with message |

---

## Implementation Order

### Phase 1: Foundation
1. Create `src/` directory structure
2. Implement `Task` model
3. Implement `TaskManager` service
4. Implement `CLIController` base
5. Create `main.py` entry point

### Phase 2: Feature Implementation
1. **Add Task** - Test TaskManager.create_task
2. **View Tasks** - Test table display
3. **Mark Complete** - Test status toggle
4. **Update Task** - Test partial updates
5. **Delete Task** - Test removal + confirmation
6. **Exit App** - Test graceful exit

### Phase 3: Testing
1. pytest unit tests for TaskManager
2. Manual acceptance testing
3. Edge case validation

---

## Dependencies

```toml
# pyproject.toml
[project]
requires-python = ">=3.13"
dependencies = [
    "rich>=13.0.0",
    "questionary>=2.0.0",
]
```

---

## Files to Generate

| File | Description |
|------|-------------|
| `src/__init__.py` | Package init |
| `src/models/__init__.py` | Models package |
| `src/models/task.py` | Task entity |
| `src/services/__init__.py` | Services package |
| `src/services/task_manager.py` | Task CRUD operations |
| `src/ui/__init__.py` | UI package |
| `src/ui/cli_controller.py` | CLI interactions |
| `src/main.py` | Entry point |
| `pyproject.toml` | Project configuration |
| `tests/__init__.py` | Tests package |
| `tests/test_task_manager.py` | Unit tests |

---

**Plan Generated:** 2026-01-01
**Phase:** I - Todo Console Application
**Status:** Ready for /sp.tasks

---

## Next Steps

1. Run `/sp.tasks` for detailed implementation task breakdown
2. Implement foundation modules (Task, TaskManager)
3. Implement CLI controller
4. Create main entry point
5. Write unit tests
6. Validate against acceptance criteria
