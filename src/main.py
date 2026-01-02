"""Todo Console Application - Entry point."""

from src.ui.cli_controller import CLIController


def main() -> None:
    """Application entry point.

    Initializes the CLI controller and starts the application loop.
    """
    controller = CLIController()
    controller.run()


if __name__ == "__main__":
    main()
