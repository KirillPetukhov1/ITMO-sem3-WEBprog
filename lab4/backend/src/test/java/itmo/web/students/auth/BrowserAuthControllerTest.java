package itmo.web.students.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import itmo.web.students.auth.config.JwtProperties;
import itmo.web.students.auth.dto.LoginRequest;
import itmo.web.students.auth.dto.TokenPairResponse;
import itmo.web.students.error.ApiException;
import itmo.web.students.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BrowserAuthControllerTest {
    private final AuthService auth = mock(AuthService.class);
    private final UserService users = mock(UserService.class);
    private final JwtProperties jwt = new JwtProperties("unused", "students-api", "students-api",
            Duration.ofMinutes(15), Duration.ofDays(7));

    @Test
    void loginKeepsRefreshTokenOutOfJsonAndSetsProtectedCookie() throws Exception {
        var controller = new BrowserAuthController(auth, users, jwt, true);
        var request = new LoginRequest("testuser", "password123");
        when(auth.login(request)).thenReturn(new TokenPairResponse("access-value", "refresh-secret", "Bearer", 900));

        var response = controller.login(request, "XMLHttpRequest", null);
        String json = new ObjectMapper().writeValueAsString(response.getBody());
        String cookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(json.contains("access-value"));
        assertFalse(json.contains("refresh-secret"));
        assertFalse(json.contains("refreshToken"));
        assertNotNull(cookie);
        assertTrue(cookie.contains("HttpOnly"));
        assertTrue(cookie.contains("Secure"));
        assertTrue(cookie.contains("SameSite=Strict"));
        assertTrue(cookie.contains("Path=/api/auth/session"));
        assertTrue(response.getHeaders().getCacheControl().contains("no-store"));
    }

    @Test
    void refreshRejectsMissingBrowserMarker() {
        var controller = new BrowserAuthController(auth, users, jwt, false);

        ApiException error = assertThrows(ApiException.class,
                () -> controller.refresh("refresh-secret", null));

        assertEquals(403, error.getStatus());
        verifyNoInteractions(auth);
    }

    @Test
    void refreshReplacesCookieWithoutExposingNewRefreshToken() throws Exception {
        var controller = new BrowserAuthController(auth, users, jwt, true);
        when(auth.refresh(any())).thenReturn(new TokenPairResponse("new-access", "new-refresh", "Bearer", 900));

        var response = controller.refresh("old-refresh", "XMLHttpRequest");
        String json = new ObjectMapper().writeValueAsString(response.getBody());
        String cookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);

        verify(auth).refresh(argThat(request -> request.refreshToken().equals("old-refresh")));
        assertTrue(json.contains("new-access"));
        assertFalse(json.contains("new-refresh"));
        assertNotNull(cookie);
        assertTrue(cookie.contains("new-refresh"));
        assertTrue(cookie.contains("HttpOnly"));
    }

    @Test
    void logoutRevokesRefreshTokenAndClearsCookie() {
        var controller = new BrowserAuthController(auth, users, jwt, false);

        var response = controller.logout("refresh-secret", "XMLHttpRequest");
        String cookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);

        assertEquals(204, response.getStatusCode().value());
        verify(auth).logout(argThat(request -> request.refreshToken().equals("refresh-secret")));
        assertNotNull(cookie);
        assertTrue(cookie.contains("Max-Age=0"));
        assertTrue(cookie.contains("HttpOnly"));
        assertTrue(cookie.contains("SameSite=Strict"));
    }
}
