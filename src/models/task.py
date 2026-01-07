"""Task entity module."""

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

    # Validation constants
    VALID_TITLE_LENGTH = (1, 100)
    VALID_DESCRIPTION_LENGTH = (0, 500)

    def __post_init__(self) -> None:
        """Validate after initialization."""
        self._validate()

    def _validate(self) -> None:
        """Validate task attributes."""
        title = self.title.strip() if isinstance(self.title, str) else ""
        if not self.VALID_TITLE_LENGTH[0] <= len(title) <= self.VALID_TITLE_LENGTH[1]:
            raise ValueError(
                f"Title must be {self.VALID_TITLE_LENGTH[0]}-{self.VALID_TITLE_LENGTH[1]} characters"
            )
        # Strip title and ensure it's not empty after stripping
        if isinstance(self.title, str) and self.title.strip():
            self.title = self.title.strip()
        else:
            self.title = ""
        if self.description is not None:
            desc = self.description.strip() if isinstance(self.description, str) else ""
            if desc:
                self.description = desc
            else:
                self.description = None
                return
            if len(self.description) > self.VALID_DESCRIPTION_LENGTH[1]:
                raise ValueError(
                    f"Description must be max {self.VALID_DESCRIPTION_LENGTH[1]} characters"
                )

    def update(self, title: Optional[str] = None, description: Optional[str] = None) -> None:
        """Update task fields if provided.

        Args:
            title: New title (optional). If provided and non-empty, updates the title.
            description: New description (optional). If provided, updates the description.
        """
        if title is not None and title.strip():
            self.title = title.strip()
        if description is not None:
            if description.strip():
                self.description = description.strip()
            else:
                # Empty string sets description to None
                self.description = None
        self._validate()
