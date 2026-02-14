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

    def _display_welcome(self) -> None:
        """Display a polished welcome banner."""
        welcome_text = Text()
        welcome_text.append("Todo App ", style="bold cyan")
        welcome_text.append("v1.0.0", style="dim")
        welcome_text.append("\n\n", style="")
        welcome_text.append("Manage your tasks with ease.", style="italic dim")

        self.console.print(
            Panel(
                welcome_text,
                title="Welcome",
                style="blue",
                subtitle="Use arrow keys to navigate, Enter to select",
            )
        )

    def _display_goodbye(self) -> None:
        """Display a polished goodbye message."""
        goodbye_text = Text()
        goodbye_text.append("Thank you for using Todo App!\n\n", style="")
        goodbye_text.append("Goodbye! 👋", style="bold green")

        self.console.print(Panel(goodbye_text, title="Exit", style="blue"))

    def _main_menu(self) -> str:
        """Display the main menu using Questionary and return the user's selection.

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
            instruction="Select an option",
        ).ask()

    def _display_success(self, message: str, title: str = "Success") -> None:
        """Display a styled success message.

        Args:
            message: The success message to display.
            title: The title for the panel.
        """
        self.console.print(
            Panel(
                message,
                title=f"✅ {title}",
                style="green",
            )
        )

    def _display_error(self, message: str) -> None:
        """Display a styled error message.

        Args:
            message: The error message to display.
        """
        self.console.print(
            Panel(
                message,
                title="❌ Error",
                style="red",
            )
        )

    def _display_info(self, message: str, title: str = "Info") -> None:
        """Display a styled info message.

        Args:
            message: The info message to display.
            title: The title for the panel.
        """
        self.console.print(
            Panel(
                message,
                title=f"ℹ️ {title}",
                style="blue",
            )
        )

    def _display_warning(self, message: str) -> None:
        """Display a styled warning message.

        Args:
            message: The warning message to display.
        """
        self.console.print(
            Panel(
                message,
                title="⚠️ Warning",
                style="yellow",
            )
        )

    def add_task(self) -> None:
        """Interactive add task flow.

        Prompts user for task title and optional description,
        creates the task, and displays a success message.
        """
        # Prompt for title with validation
        title = questionary.text(
            "Task title:",
            instruction="Required",
            validate=lambda text: len(text.strip()) > 0 or "Title cannot be empty",
        ).ask()

        # Prompt for optional description
        description = questionary.text(
            "Description (optional):",
            instruction="Press Enter to skip",
        ).ask()

        # Create the task
        task = self._task_manager.create_task(
            title=title.strip(),
            description=description.strip() if description.strip() else None,
        )

        # Display success message with Rich
        task_details = Text()
        task_details.append(f"ID:      ", style="bold")
        task_details.append(f"{task.id}\n", style="cyan")
        task_details.append(f"Title:   ", style="bold")
        task_details.append(f"{task.title}\n", style="magenta")
        task_details.append(f"Status:  ", style="bold")
        task_details.append("Pending ⏳", style="yellow")

        self.console.print(
            Panel(
                task_details,
                title="✅ Task Added",
                style="green",
                subtitle=(
                    f"Task created at {task.created_at.strftime('%H:%M:%S')}"
                    if task.created_at
                    else ""
                ),
            )
        )

    def view_tasks(self) -> None:
        """Display all tasks in a formatted table.

        Shows all tasks with their ID, title, description, and status.
        Completed tasks are styled with green, pending with yellow.
        Displays empty state message when no tasks exist.
        """
        tasks = self._task_manager.get_all_tasks()

        # Empty state handling
        if not tasks:
            empty_text = Text()
            empty_text.append("📭 No tasks yet!\n\n", style="bold")
            empty_text.append("Use ", style="")
            empty_text.append("'Add Task'", style="cyan")
            empty_text.append(" to create your first task.", style="")
            self.console.print(
                Panel(
                    empty_text,
                    title="📋 View Tasks",
                    style="blue",
                    subtitle="No tasks available",
                )
            )
            return

        # Create styled table
        table = Table(
            title="📋 Your Tasks",
            show_header=True,
            header_style="bold magenta",
            border_style="blue",
            expand=True,
            show_lines=True,
        )

        # Add columns
        table.add_column("ID", width=4, justify="center", style="cyan")
        table.add_column("Title", width=25, style="white")
        table.add_column("Description", width=40, style="dim")
        table.add_column("Status", width=12, justify="center", style="bold")

        # Add rows with styling
        for task in tasks:
            # Style based on completion status
            if task.completed:
                status_style = "green"
                status_icon = "✅ Complete"
                title_style = "strike dim green"
                desc_style = "dim green"
            else:
                status_style = "yellow"
                status_icon = "⏳ Pending"
                title_style = "white"
                desc_style = "dim white"

            # Truncate long descriptions
            description = task.description or "-"
            if len(description) > 38:
                description = description[:35] + "..."

            table.add_row(
                f"{task.id}",
                f"{task.title}",
                f"{description}",
                f"{status_icon}",
                style=None,
            )

        self.console.print(table)

    def mark_complete(self) -> None:
        """Mark a task as complete.

        Prompts user for task ID, validates it, and marks the task as complete.
        Displays success feedback or error messages based on outcome.
        Handles invalid IDs and already-completed tasks gracefully.
        """
        # Prompt for task ID
        task_id_str = questionary.text(
            "Enter task ID to mark as complete:",
            instruction="Enter the ID number",
        ).ask()

        # Validate task ID is a number
        try:
            task_id = int(task_id_str.strip())
        except (ValueError, AttributeError):
            self._display_error("Invalid task ID. Please enter a valid number.")
            return

        # Attempt to mark task as complete
        try:
            task = self._task_manager.mark_complete(task_id)

            # Display success message with Rich
            task_details = Text()
            task_details.append(f"ID:      ", style="bold")
            task_details.append(f"{task.id}\n", style="cyan")
            task_details.append(f"Title:   ", style="bold")
            task_details.append(f"{task.title}\n", style="magenta")
            task_details.append(f"Status:  ", style="bold")
            task_details.append("Complete ✅", style="green bold")

            self.console.print(
                Panel(
                    task_details,
                    title="✅ Task Completed",
                    style="green",
                    subtitle="Well done!",
                )
            )

        except KeyError:
            # Task not found
            self._display_error(f"Task with ID {task_id} not found.")
        except ValueError as e:
            # Already completed
            self._display_warning(str(e))

    def update_task(self) -> None:
        """Update an existing task's title and/or description.

        Prompts user for task ID and new values. Empty inputs preserve existing values.
        Displays success feedback or error messages based on outcome.
        Handles invalid IDs gracefully.
        """
        # Prompt for task ID
        task_id_str = questionary.text(
            "Enter task ID to update:",
            instruction="Enter the ID number",
        ).ask()

        # Validate task ID is a number
        try:
            task_id = int(task_id_str.strip())
        except (ValueError, AttributeError):
            self._display_error("Invalid task ID. Please enter a valid number.")
            return

        # Check if task exists
        task = self._task_manager.get_task_by_id(task_id)
        if task is None:
            self._display_error(f"Task with ID {task_id} not found.")
            return

        # Show current values and prompt for new ones
        self.console.print(
            Panel(
                f"Current Title: [magenta]{task.title}[/magenta]\n"
                f"Current Description: [dim]{task.description or 'None'}[/dim]",
                title=f"📝 Updating Task {task_id}",
                style="blue",
            )
        )

        # Prompt for new title (preserve existing if empty)
        new_title = questionary.text(
            "New title:",
            instruction="Press Enter to keep current title",
            default="",
        ).ask()

        # Prompt for new description (preserve existing if empty)
        new_description = questionary.text(
            "New description:",
            instruction="Press Enter to keep current description",
            default="",
        ).ask()

        # Determine what to update
        title_to_update = new_title.strip() if new_title and new_title.strip() else None
        description_to_update = (
            new_description.strip()
            if new_description and new_description.strip()
            else None
        )

        # If both are empty, nothing to update
        if title_to_update is None and description_to_update is None:
            self._display_info(
                "No changes made. Both title and description were empty.", "No Update"
            )
            return

        # Update the task
        try:
            updated_task = self._task_manager.update_task(
                task_id, title=title_to_update, description=description_to_update
            )

            # Display success message with Rich
            task_details = Text()
            task_details.append(f"ID:          ", style="bold")
            task_details.append(f"{updated_task.id}\n", style="cyan")
            task_details.append(f"Title:       ", style="bold")
            task_details.append(f"{updated_task.title}\n", style="magenta")
            task_details.append(f"Description: ", style="bold")
            task_details.append(f"{updated_task.description or 'None'}\n", style="dim")
            task_details.append(f"Status:      ", style="bold")
            status_text = "Complete ✅" if updated_task.completed else "Pending ⏳"
            status_style = "green" if updated_task.completed else "yellow"
            task_details.append(status_text, style=status_style)

            self.console.print(
                Panel(
                    task_details,
                    title="✅ Task Updated",
                    style="green",
                    subtitle="Changes saved successfully",
                )
            )

        except (KeyError, ValueError) as e:
            # Handle any update errors
            self._display_error(f"Failed to update task: {e}")

    def delete_task(self) -> None:
        """Delete an existing task with confirmation.

        Prompts user for task ID, asks for confirmation, and removes the task.
        Displays success feedback, cancellation message, or error messages.
        Handles invalid IDs gracefully.
        """
        # Prompt for task ID
        task_id_str = questionary.text(
            "Enter task ID to delete:",
            instruction="Enter the ID number",
        ).ask()

        # Validate task ID is a number
        try:
            task_id = int(task_id_str.strip())
        except (ValueError, AttributeError):
            self._display_error("Invalid task ID. Please enter a valid number.")
            return

        # Check if task exists
        task = self._task_manager.get_task_by_id(task_id)
        if task is None:
            self._display_error(f"Task with ID {task_id} not found.")
            return

        # Ask for confirmation
        confirm = questionary.confirm(
            f"Are you sure you want to delete task '{task.title}'?",
            default=False,
            instruction="This action cannot be undone",
        ).ask()

        if confirm:
            try:
                self._task_manager.delete_task(task_id)
                self._display_success(
                    f"Task {task_id} ('{task.title}') has been permanently deleted.",
                    "Task Deleted",
                )
            except KeyError:
                self._display_error(f"Task with ID {task_id} was already removed.")
        else:
            self._display_info("Deletion cancelled. Task was not removed.", "Cancelled")

    def run(self) -> None:
        """Main application loop.

        Continuously displays the menu and handles all task operations
        until the user chooses to exit.
        """
        # Display welcome banner on first run
        self._display_welcome()

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
                self._display_goodbye()
                break
