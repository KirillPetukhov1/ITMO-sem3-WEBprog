package itmo.web.students.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class ApiAccessDeniedHandler implements AccessDeniedHandler {
    private final ApiErrorWriter writer;

    public ApiAccessDeniedHandler(ApiErrorWriter writer) {
        this.writer = writer;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex) throws IOException {
        writer.write(response, 403, "ACCESS_DENIED", "Недостаточно прав");
    }
}
