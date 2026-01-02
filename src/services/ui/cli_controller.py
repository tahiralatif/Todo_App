"""CLI Controller module for user interaction."""

from typing import Optional
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box
import questionary

from src.services.task_manager import TaskManager


class CLIController:
    """Handles CLI interactions using Rich and Questionary."""

    def __init__(self) -> None:
        """Initialize the CLI controller with TaskManager and Rich Console."""
        self._task_manager = TaskManager()
        self.console = Console()

    def _main_menu(self) -> str:
        """Display the main menu and return the user's selection.

        Returns:
            The selected menu option.
        """
        return questionary.select(
            "What would you like to do?",
            choices=[
                "Add Task",
                "View Tasks",
                "Update Task",
                "Delete Task",
                "Mark Task as Complete",
                "Exit",
            ],
        ).ask()

    def add_task(self) -> None:
        """Interactive add task flow.

        Prompts user for task title and optional description,
        creates the task, and displays a success message.
        """
        title = questionary.text("Task title:").ask()

        # Validate title is not empty or whitespace-only
        if not title or not title.strip():
            self.console.print(
                Panel(
                    "Title cannot be empty. Please enter a valid task title.",
                    title="Error",
                    style="red",
                )
            )
            return

        description = questionary.text("Description (optional):").ask()

        # Create the task
        task = self._task_manager.create_task(title, description)

        # Display success message with Rich
        self.console.print(
            Panel(
                f"Task created successfully!\n\n"
                f"ID: {task.id}\n"
                f"Title: {task.title}\n"
                f"Description: {task.description or 'N/A'}",
                title="✅ Task Added",
                style="green",
            )
        )

    def view_tasks(self) -> None:
        """Display all tasks in a Rich table.

        Shows empty state if no tasks exist.
        """
        tasks = self._task_manager.get_all_tasks()

        if not tasks:
            self.console.print(
                Panel(
                    "No tasks yet! Add your first task.",
                    title="Tasks",
                    style="yellow",
                )
            )
            return

        # Create Rich table for task display
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
                status,
            )

        self.console.print(table)

    def update_task(self) -> None:
        """Update an existing task.

        Prompts for task ID, then for new title and description
        (both optional - empty input preserves existing values).
        """
        task_id_input = questionary.text("Enter task ID to update:").ask()

        try:
            task_id = int(task_id_input)
        except ValueError:
            self.console.print(
                Panel(
                    "Invalid ID. Please enter a numeric task ID.",
                    title="Error",
                    style="red",
                )
            )
            return

        task = self._task_manager.get_task_by_id(task_id)
        if task is None:
            self.console.print(
                Panel(
                    f"Task {task_id} not found.",
                    title="Error",
                    style="red",
                )
            )
            return

        new_title = questionary.text(
            f"New title (leave empty to keep '{task.title}'):"
        ).ask()
        new_desc = questionary.text(
            f"New description (leave empty to keep):"
        ).ask()

        self._task_manager.update_task(
            task_id,
            title=new_title if new_title.strip() else None,
            description=new_desc if new_desc.strip() else None,
        )
        self.console.print(
            Panel(
                f"Task {task_id} updated successfully.",
                title="✅ Updated",
                style="green",
            )
        )

    def delete_task(self) -> None:
        """Delete a task with confirmation.

        Prompts for task ID, then asks for confirmation before deletion.
        """
        task_id_input = questionary.text("Enter task ID to delete:").ask()

        try:
            task_id = int(task_id_input)
        except ValueError:
            self.console.print(
                Panel(
                    "Invalid ID. Please enter a numeric task ID.",
                    title="Error",
                    style="red",
                )
            )
            return

        task = self._task_manager.get_task_by_id(task_id)
        if task is None:
            self.console.print(
                Panel(
                    f"Task {task_id} not found.",
                    title="Error",
                    style="red",
                )
            )
            return

        if questionary.confirm(f"Delete '{task.title}'?").ask():
            self._task_manager.delete_task(task_id)
            self.console.print(
                Panel(
                    f"Task {task_id} deleted.",
                    title="✅ Deleted",
                    style="green",
                )
            )
        else:
            self.console.print(
                Panel(
                    "Deletion cancelled.",
                    title="Cancelled",
                    style="yellow",
                )
            )

    def mark_complete(self) -> None:
        """Mark a task as complete.

        Prompts for task ID and marks the task as completed.
        """
        task_id_input = questionary.text("Enter task ID to mark complete:").ask()

        try:
            task_id = int(task_id_input)
        except ValueError:
            self.console.print(
                Panel(
                    "Invalid ID. Please enter a numeric task ID.",
                    title="Error",
                    style="red",
                )
            )
            return

        try:
            task = self._task_manager.mark_complete(task_id)
            self.console.print(
                Panel(
                    f"Task {task_id} marked as complete!\n\n"
                    f"Title: {task.title}",
                    title="✅ Done",
                    style="green",
                )
            )
        except KeyError:
            self.console.print(
                Panel(
                    f"Task {task_id} not found.",
                    title="Error",
                    style="red",
                )
            )
        except ValueError as e:
            self.console.print(
                Panel(
                    str(e),
                    title="Warning",
                    style="yellow",
                )
            )

    def run(self) -> None:
        """Main application loop.

        Continuously displays the menu and handles user selections
        until the user chooses to exit.
        """
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
                self.console.print(
                    Panel(
                        "Goodbye! 👋",
                        title="Exit",
                        style="blue",
                    )
                )
                break
