package itmo.web.students.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import itmo.web.students.auth.dto.LoginRequest;
import itmo.web.students.auth.dto.RefreshTokenRequest;
import itmo.web.students.auth.dto.RegisterRequest;
import itmo.web.students.auth.dto.TokenPairResponse;
import itmo.web.students.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@SecurityRequirements
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Регистрация пользователя с ролью USER")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return service.register(request);
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Вход: access JWT и refresh-токен")
    public ResponseEntity<TokenPairResponse> login(@Valid @RequestBody LoginRequest request) {
        return noStore(service.login(request));
    }

    @PostMapping(value = "/refresh", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Обмен refresh-токена и выдача новой пары")
    public ResponseEntity<TokenPairResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return noStore(service.refresh(request));
    }

    @PostMapping(value = "/logout", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Отзыв refresh-токена")
    public void logout(@Valid @RequestBody RefreshTokenRequest request) {
        service.logout(request);
    }

    private ResponseEntity<TokenPairResponse> noStore(TokenPairResponse pair) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(pair);
    }
}
