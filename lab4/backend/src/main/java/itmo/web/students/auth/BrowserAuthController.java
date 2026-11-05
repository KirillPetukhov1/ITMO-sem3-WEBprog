package itmo.web.students.auth;

import itmo.web.students.auth.config.JwtProperties;
import itmo.web.students.auth.dto.BrowserTokenResponse;
import itmo.web.students.auth.dto.LoginRequest;
import itmo.web.students.auth.dto.RefreshTokenRequest;
import itmo.web.students.auth.dto.TokenPairResponse;
import itmo.web.students.error.ApiException;
import itmo.web.students.user.UserService;
import itmo.web.students.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/auth/session", produces = MediaType.APPLICATION_JSON_VALUE)
public class BrowserAuthController {
    private static final String COOKIE_NAME = "lab4_refresh";
    private static final String COOKIE_PATH = "/api/auth/session";
    private static final String REQUEST_MARKER = "XMLHttpRequest";

    private final AuthService auth;
    private final UserService users;
    private final JwtProperties jwt;
    private final boolean cookieSecure;

    public BrowserAuthController(AuthService auth, UserService users, JwtProperties jwt,
                                 @Value("${app.cookie-secure:false}") boolean cookieSecure) {
        this.auth = auth;
        this.users = users;
        this.jwt = jwt;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BrowserTokenResponse> login(@Valid @RequestBody LoginRequest request,
            @RequestHeader(value = "X-Requested-With", required = false) String marker,
            @CookieValue(value = COOKIE_NAME, required = false) String oldRefreshToken) {
        requireBrowserRequest(marker);
        TokenPairResponse pair = auth.login(request);
        if (oldRefreshToken != null && !oldRefreshToken.isBlank()) {
            auth.logout(new RefreshTokenRequest(oldRefreshToken));
        }
        return withCookie(pair);
    }

    @PostMapping("/refresh")
    public ResponseEntity<BrowserTokenResponse> refresh(
            @CookieValue(value = COOKIE_NAME, required = false) String raw,
            @RequestHeader(value = "X-Requested-With", required = false) String marker) {
        requireBrowserRequest(marker);
        if (raw == null || raw.isBlank()) {
            throw new ApiException(401, "NO_SESSION", "Сессия отсутствует");
        }
        return withCookie(auth.refresh(new RefreshTokenRequest(raw)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(value = COOKIE_NAME, required = false) String raw,
            @RequestHeader(value = "X-Requested-With", required = false) String marker) {
        requireBrowserRequest(marker);
        if (raw != null && !raw.isBlank()) {
            auth.logout(new RefreshTokenRequest(raw));
        }
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, clearCookie()).build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal Jwt principal) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(UserResponse.from(users.findByUsername(principal.getSubject())));
    }

    private ResponseEntity<BrowserTokenResponse> withCookie(TokenPairResponse pair) {
        String cookie = ResponseCookie.from(COOKIE_NAME, pair.refreshToken())
                .httpOnly(true).secure(cookieSecure).sameSite("Strict")
                .path(COOKIE_PATH).maxAge(jwt.refreshTtl()).build().toString();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .header(HttpHeaders.SET_COOKIE, cookie).body(BrowserTokenResponse.from(pair));
    }

    private String clearCookie() {
        return ResponseCookie.from(COOKIE_NAME, "").httpOnly(true).secure(cookieSecure)
                .sameSite("Strict").path(COOKIE_PATH).maxAge(0).build().toString();
    }

    private void requireBrowserRequest(String marker) {
        if (!REQUEST_MARKER.equals(marker)) {
            throw new ApiException(403, "FORBIDDEN_REQUEST", "Недопустимый запрос");
        }
    }
}
