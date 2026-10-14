package itmo.web.students.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.AssertTrue;
import com.fasterxml.jackson.annotation.JsonIgnore;

public record LoginRequest(@NotBlank @Size(max = 50) String username,
                           @NotBlank @Size(max = 72) String password) {
    @AssertTrue(message = "Пароль должен занимать не более 72 байт UTF-8")
    @JsonIgnore
    public boolean isPasswordLengthValid() {
        return password == null || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72;
    }
}
