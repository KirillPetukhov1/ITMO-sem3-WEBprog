package itmo.web.students.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.*;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

public record RegisterRequest(
        @NotBlank @Pattern(regexp = "[A-Za-z0-9_.-]{3,50}", message = "Username: 3–50 латинских букв, цифр, точек, дефисов или подчёркиваний") String username,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 72) String password
) {
    public RegisterRequest {
        username = username == null ? null : username.strip();
        email = email == null ? null : email.strip().toLowerCase(Locale.ROOT);
    }

    @AssertTrue(message = "Пароль должен занимать не более 72 байт UTF-8")
    @JsonIgnore
    public boolean isPasswordLengthValid() {
        return password == null || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}
