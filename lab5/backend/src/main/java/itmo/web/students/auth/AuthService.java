package itmo.web.students.auth;

import itmo.web.students.auth.dto.LoginRequest;
import itmo.web.students.auth.dto.RefreshTokenRequest;
import itmo.web.students.auth.dto.RegisterRequest;
import itmo.web.students.auth.dto.TokenPairResponse;
import itmo.web.students.user.UserService;
import itmo.web.students.user.dto.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserService users;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokens;

    public AuthService(UserService users, AuthenticationManager authenticationManager, RefreshTokenService refreshTokens) {
        this.users = users;
        this.authenticationManager = authenticationManager;
        this.refreshTokens = refreshTokens;
    }

    public UserResponse register(RegisterRequest request) {
        return UserResponse.from(users.register(request.username(), request.email(), request.password()));
    }

    public TokenPairResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        return refreshTokens.issue(users.findByUsername(authentication.getName()));
    }

    public TokenPairResponse refresh(RefreshTokenRequest request) {
        return refreshTokens.rotate(request.refreshToken());
    }

    public void logout(RefreshTokenRequest request) {
        refreshTokens.revoke(request.refreshToken());
    }
}
