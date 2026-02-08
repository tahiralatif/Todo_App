from __future__ import annotations

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


AUTH_REQUIRED = "AUTH_REQUIRED"
INVALID_TOKEN = "INVALID_TOKEN"
FORBIDDEN = "FORBIDDEN"
VALIDATION_ERROR = "VALIDATION_ERROR"
CONFLICT = "CONFLICT"
RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
INTERNAL_ERROR = "INTERNAL_ERROR"


def _error_code_from_status(status_code: int) -> str:
    if status_code == 401:
        return AUTH_REQUIRED
    if status_code == 403:
        return FORBIDDEN
    if status_code == 404:
        return RESOURCE_NOT_FOUND
    if status_code == 409:
        return CONFLICT
    if status_code == 422:
        return VALIDATION_ERROR
    return INTERNAL_ERROR


def error_response(
    status_code: int, code: str, message: str, details: object | None = None
):
    payload: dict[str, object] = {
        "success": False,
        "error": {"code": code, "message": message},
    }
    if details is not None:
        payload["error"] = {"code": code, "message": message, "details": details}
    return JSONResponse(status_code=status_code, content=payload)


def install_error_handlers(app) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        return error_response(
            status_code=422,
            code=VALIDATION_ERROR,
            message="Validation error",
            details=exc.errors(),
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        if isinstance(exc.detail, str) and exc.detail in {
            AUTH_REQUIRED,
            INVALID_TOKEN,
            FORBIDDEN,
            VALIDATION_ERROR,
            CONFLICT,
            RESOURCE_NOT_FOUND,
            INTERNAL_ERROR,
        }:
            code = exc.detail
            message = exc.detail
        else:
            code = _error_code_from_status(exc.status_code)
            message = str(exc.detail)

        return error_response(status_code=exc.status_code, code=code, message=message)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        return error_response(
            status_code=500, code=INTERNAL_ERROR, message="Internal error"
        )
