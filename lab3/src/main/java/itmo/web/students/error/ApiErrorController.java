package itmo.web.students.error;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class ApiErrorController implements ErrorController {
    @RequestMapping("/error")
    public ResponseEntity<ApiError> error(HttpServletRequest request) {
        Object attribute = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        int status = attribute instanceof Integer value ? value : 500;
        String code = switch (status) {
            case 400 -> "BAD_REQUEST";
            case 404 -> "NOT_FOUND";
            case 405 -> "METHOD_NOT_ALLOWED";
            default -> status >= 500 ? "INTERNAL_ERROR" : "HTTP_ERROR";
        };
        String message = status == 404 ? "Адрес API не найден" : status >= 500 ? "Внутренняя ошибка сервера" : "Ошибка HTTP";
        return ResponseEntity.status(status).body(ApiError.of(code, message, null));
    }
}
