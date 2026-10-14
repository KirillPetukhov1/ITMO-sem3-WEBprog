package itmo.web.students.error;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiError> application(ApiException ex) {
        return reply(ex.getStatus(), ex.getCode(), ex.getMessage(), ex.getDetails());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex) {
        Map<String, List<String>> details = new TreeMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e ->
                details.computeIfAbsent(e.getField().equals("settlementDateValid") ? "settlementDate" : e.getField(), k -> new ArrayList<>()).add(e.getDefaultMessage()));
        return reply(422, "VALIDATION_ERROR", "Проверьте введенные данные", details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof JsonParseException)
                return reply(400, "INVALID_JSON", "Некорректный JSON в теле запроса", null);
            if (cause instanceof UnrecognizedPropertyException unknown)
                return reply(422, "VALIDATION_ERROR", "Проверьте введенные данные",
                        Map.of(unknown.getPropertyName(), List.of("Неизвестное поле")));
            cause = cause.getCause();
        }
        cause = ex.getCause();
        if (cause instanceof JsonMappingException mapping) {
            String field = mapping.getPath().isEmpty() ? "non_field_errors" : mapping.getPath().get(0).getFieldName();
            return reply(422, "VALIDATION_ERROR", "Проверьте введенные данные",
                    Map.of(field == null ? "non_field_errors" : field, List.of("Неверный тип или формат JSON-значения")));
        }
        return reply(400, "INVALID_JSON", "Некорректный JSON в теле запроса", null);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> authentication(AuthenticationException ex) {
        return reply(401, "INVALID_CREDENTIALS", "Неверное имя пользователя или пароль", null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> denied(AccessDeniedException ex) {
        return reply(403, "ACCESS_DENIED", "Недостаточно прав", null);
    }

    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    ResponseEntity<ApiError> notFound(Exception ex) {
        return reply(404, "NOT_FOUND", "Адрес API не найден", null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ApiError> method(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(405).headers(ex.getHeaders())
                .body(ApiError.of("METHOD_NOT_ALLOWED", "Метод не поддерживается", null));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ApiError> media(Exception ex) {
        return reply(415, "UNSUPPORTED_MEDIA_TYPE", "Ожидается Content-Type: application/json", null);
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    ResponseEntity<ApiError> accept(Exception ex) {
        return reply(406, "NOT_ACCEPTABLE", "Запрошенный формат ответа не поддерживается", null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ApiError> badRequest(Exception ex) {
        return reply(400, "BAD_REQUEST", "Некорректный запрос", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> integrity(Exception ex) {
        return reply(409, "CONFLICT", "Нарушено ограничение уникальности или связи данных", null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception ex) {
        log.error("Необработанная ошибка API", ex);
        return reply(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера", null);
    }

    private ResponseEntity<ApiError> reply(int status, String code, String message, Object details) {
        return ResponseEntity.status(status).body(ApiError.of(code, message, details));
    }
}
