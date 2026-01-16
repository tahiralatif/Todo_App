"""FastAPI application entry point (Phase-2 Backend Evolution)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from src.config import settings
from src.db import init_db
from src.middleware.errors import install_error_handlers
from src.routes.auth import router as auth_router
from src.routes.tasks import router as tasks_router

# Ensure models are imported so SQLModel metadata includes tables
from src.models.task import Task  # noqa: F401
from src.models.user import User  # noqa: F401


app = FastAPI(
    title="Todo App API",
    description="Phase-2 Todo backend API.",
    version="1.0.0",
    # Add security-related configurations
    docs_url="/docs" if settings.debug else None,  # Disable docs in production
    redoc_url="/redoc" if settings.debug else None,  # Disable redoc in production
)

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(",") if hasattr(settings, 'allowed_origins') and settings.allowed_origins else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    # Expose headers for authentication
    expose_headers=["Access-Control-Allow-Origin"],
)

# Trusted Host Middleware to prevent HTTP Host Header attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts.split(",") if hasattr(settings, 'allowed_hosts') and settings.allowed_hosts else ["*"],
)

install_error_handlers(app)


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}


# Register route handlers
app.include_router(auth_router)
app.include_router(tasks_router)


# Note: routes, auth middleware, and API endpoints are added in later tasks/phases.


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
