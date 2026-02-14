"""FastAPI application entry point (Phase-3 AI Chatbot)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from fastapi.staticfiles import StaticFiles

from src.config import settings
from src.db import init_db
from src.middleware.errors import install_error_handlers
from src.routes.auth import router as auth_router
from src.routes.chat import router as chat_router

# Ensure models are imported so SQLModel metadata includes tables
from src.models.task import Task  # noqa: F401
from src.models.user import User  # noqa: F401
from src.models.conversation import Conversation  # noqa: F401
from src.models.message import Message  # noqa: F401


app = FastAPI(
    title="AI Todo Chatbot API",
    description="Phase-3 AI-Powered Todo Chatbot backend API with MCP server and OpenAI integration.",
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
        title="AI Todo Chatbot API",
        version="1.0.0",
        description="Phase-3 AI-Powered Todo Chatbot backend API with MCP server and OpenAI integration.",
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
            if path.startswith("/api/") and not path.startswith("/api/auth"):
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# CORS configuration for production - more permissive for development
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",  # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],
)

# Trusted Host Middleware - permissive for development
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # Allow all hosts in development
)

install_error_handlers(app)


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()
    
    # Initialize MCP server
    try:
        from src.mcp_server.tools import initialize_mcp_server
        await initialize_mcp_server()
        print("MCP server initialized successfully")
    except Exception as e:
        print(f"MCP server initialization failed: {e}")
    
    # Initialize AI Agent
    try:
        from src.agents.todo_agent import initialize_todo_agent
        initialize_todo_agent()
        print("AI Todo Agent initialized successfully")
    except Exception as e:
        print(f"AI Todo Agent initialization failed: {e}")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy"}


# Register route handlers
app.include_router(auth_router)
app.include_router(chat_router)

# Mount static files for profile photos
import os
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
