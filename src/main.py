"""Todo Console Application - Entry point."""

import sys
from src.ui.cli_controller import CLIController


def main() -> None:
    """Application entry point.

    Initializes the CLI controller and starts the application loop.
    Ensures safe exit on completion or interruption.
    """
    try:
        controller = CLIController()
        controller.run()
        # Ensure clean exit after loop finishes (Phase 8 requirement)
        sys.exit(0)
    except KeyboardInterrupt:
        # Handle Ctrl+C gracefully
        from rich.console import Console
        Console().print("\n\nOperation cancelled. Goodbye! 👋", style="bold green")
        sys.exit(0)


if __name__ == "__main__":
    main()
