package itmo.web.students.error;

import java.util.Map;


public record ApiError(ErrorContent error) {
    public record ErrorContent(String code, String message, Object details) {
    }

    public static ApiError of(String code, String message, Object details) {
        return new ApiError(new ErrorContent(code, message, details == null ? Map.of() : details));
    }
}
