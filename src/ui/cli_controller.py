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
                subtitle=f"Task created at {task.created_at.strftime('%H:%M:%S')}" if task.created_at else "",
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

    def run(self) -> None:
        """Main application loop - Phase 4: Add Task and View Tasks.

        Continuously displays the menu and handles Add Task and View Tasks
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
                self._display_info(
                    "Update Task feature coming in Phase 6.",
                    "Coming Soon"
                )
            elif choice == "Delete Task":
                self._display_info(
                    "Delete Task feature coming in Phase 7.",
                    "Coming Soon"
                )
            elif choice == "Mark Task as Complete":
                self._display_info(
                    "Mark Complete feature coming in Phase 5.",
                    "Coming Soon"
                )
            elif choice == "Exit":
                self._display_goodbye()
                break
