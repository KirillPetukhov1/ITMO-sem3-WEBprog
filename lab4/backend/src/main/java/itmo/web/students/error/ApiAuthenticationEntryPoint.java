package itmo.web.students.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ApiErrorWriter writer;

    public ApiAuthenticationEntryPoint(ApiErrorWriter writer) {
        this.writer = writer;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException ex) throws IOException {
        response.setHeader("WWW-Authenticate", "Bearer");
        writer.write(response, 401, "UNAUTHORIZED", "Требуется действительный access-токен");
    }
}
