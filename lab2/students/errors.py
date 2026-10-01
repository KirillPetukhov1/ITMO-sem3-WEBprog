import logging
from typing import Any
from django.http import JsonResponse
from django.http import HttpRequest
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class ApplicationError(Exception):
    """Ошибка сервиса, не зависящая от DRF."""

    def __init__(
        self,
        status: int,
        code: str,
        message: str,
        details = None,
    ) -> None:
        """Создать прикладную ошибку API.

        Args:
            status: HTTP-статус ответа.
            code: Машиночитаемый код ошибки.
            message: Сообщение для клиента.
            details: Дополнительные сведения об ошибке.
        """
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details or {}


def error_body(code: str, message: str, details = None) -> dict[str, Any]:
    """Сформировать единое JSON-представление ошибки.

    Args:
        code: Машиночитаемый код ошибки.
        message: Сообщение для клиента.
        details: Дополнительные сведения об ошибке.
    """
    return {"error": {"code": code, "message": message, "details": details or {}}}


def api_exception_handler(exc: Exception, context: dict[str, Any]) -> Response:
    """Преобразовать исключение API в стандартный HTTP-ответ.

    Args:
        exc: Перехваченное исключение.
        context: Контекст DRF, в котором возникла ошибка.
    """
    if isinstance(exc, ApplicationError):
        return Response(error_body(exc.code, exc.message, exc.details), status=exc.status)
    if isinstance(exc, ValidationError):
        return Response(error_body("VALIDATION_ERROR", "Проверьте введенные данные.", exc.detail), status=422)
    if isinstance(exc, ParseError):
        return Response(error_body("INVALID_JSON", "Некорректный JSON в теле запроса."), status=400)
    response = exception_handler(exc, context)
    if response is not None:
        codes = {400: "BAD_REQUEST", 404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED",
                 406: "NOT_ACCEPTABLE", 415: "UNSUPPORTED_MEDIA_TYPE"}
        response.data = error_body(
            codes.get(response.status_code, "HTTP_ERROR"),
            str(response.data.get("detail", "Ошибка HTTP.")),
        )
        return response
    logger.error("Необработанная ошибка API", exc_info=(
        type(exc), exc, exc.__traceback__))
    return Response(error_body("INTERNAL_ERROR", "Внутренняя ошибка сервера."), status=500)


def bad_request(request: HttpRequest, exception: Exception) -> JsonResponse:
    """Вернуть ответ для некорректного запроса.

    Args:
        request: Исходный HTTP-запрос.
        exception: Исключение, вызвавшее ошибку.
    """
    return JsonResponse(error_body("BAD_REQUEST", "Некорректный запрос."), status=400)


def not_found(request: HttpRequest, exception: Exception) -> JsonResponse:
    """Вернуть ответ, если запрошенный адрес не найден.

    Args:
        request: Исходный HTTP-запрос.
        exception: Исключение, вызвавшее ошибку.
    """


def server_error(request: HttpRequest) -> JsonResponse:
    """Вернуть ответ при внутренней ошибке сервера.

    Args:
        request: Исходный HTTP-запрос.
    """
    return JsonResponse(error_body("INTERNAL_ERROR", "Внутренняя ошибка сервера."), status=500)
