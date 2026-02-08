"""FastAPI application entry point (Phase-2 Backend Evolution)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from fastapi.staticfiles import StaticFiles

from src.config import settings
from src.db import init_db
from src.middleware.errors import install_error_handlers
from src.middleware.logging_middleware import install_logging_middleware
from src.routes.auth import router as auth_router
from src.routes.tasks import router as tasks_router
from src.routes.notifications import router as notifications_router
from src.routes.profile import router as profile_router

# Ensure models are imported so SQLModel metadata includes tables
from src.models.task import Task  # noqa: F401
from src.models.user import User  # noqa: F401
from src.models.notification import Notification  # noqa: F401


app = FastAPI(
    title="Todo App API",
    description="Phase-2 Todo backend API with JWT Authentication.",
    version="1.0.0",
    # Add security-related configurations
    docs_url="/docs" if settings.debug else None,  # Disable docs in production
    redoc_url="/redoc" if settings.debug else None,  # Disable redoc in production
)

# Add security scheme for Swagger UI
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Todo App API",
        version="1.0.0",
        description="Phase-2 Todo backend API with JWT Authentication.",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    # Add security to all protected endpoints
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            if path.startswith("/api/tasks") or path.startswith("/api/notifications") or path.startswith("/api/profile"):
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

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
install_logging_middleware(app)


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()
    # Test cloud storage connection
    try:
        from src.services.supabase_storage_service import get_supabase_storage_service
        storage_service = get_supabase_storage_service()
        if await storage_service.test_connection():
            print("Cloud storage connection successful")
        else:
            print("Cloud storage connection failed - check your configuration")
    except Exception as e:
        print(f"Cloud storage not configured: {e}")
        print("Profile photo uploads will not work until cloud storage is configured")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}


# Register route handlers
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(notifications_router)
app.include_router(profile_router)

# Mount static files for profile photos
import os
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Note: routes, auth middleware, and API endpoints are added in later tasks/phases.


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
