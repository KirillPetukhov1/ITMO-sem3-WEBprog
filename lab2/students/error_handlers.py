import logging
from django.http import JsonResponse
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler
from .exceptions import ApplicationError

logger = logging.getLogger(__name__)


def error_body(code, message, details=None):
    return {"error": {"code": code, "message": message, "details": details or {}}}


def api_exception_handler(exc, context):
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
    logger.error("Необработанная ошибка API", exc_info=(type(exc), exc, exc.__traceback__))
    return Response(error_body("INTERNAL_ERROR", "Внутренняя ошибка сервера."), status=500)


def bad_request(request, exception):
    return JsonResponse(error_body("BAD_REQUEST", "Некорректный запрос."), status=400)


def not_found(request, exception):
    return JsonResponse(error_body("NOT_FOUND", "Адрес не найден."), status=404)


def server_error(request):
    return JsonResponse(error_body("INTERNAL_ERROR", "Внутренняя ошибка сервера."), status=500)
