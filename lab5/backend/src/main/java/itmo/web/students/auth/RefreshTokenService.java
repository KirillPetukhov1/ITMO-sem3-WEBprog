package itmo.web.students.auth;

import itmo.web.students.auth.config.JwtProperties;
import itmo.web.students.auth.dto.TokenPairResponse;
import itmo.web.students.error.ApiException;
import itmo.web.students.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository repository;
    private final TokenService tokens;
    private final JwtProperties properties;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository, TokenService tokens, JwtProperties properties, Clock clock) {
        this.repository = repository;
        this.tokens = tokens;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public TokenPairResponse issue(User user) {
        return newPair(user);
    }

    @Transactional
    public TokenPairResponse rotate(String raw) {
        RefreshToken old = repository.findForUpdate(hash(raw)).orElseThrow(this::invalid);
        if (!old.isValid(clock.instant())) throw invalid();
        old.revoke();
        TokenPairResponse pair = newPair(old.getUser());
        repository.flush();
        return pair;
    }

    @Transactional
    public void revoke(String raw) {
        repository.findForUpdate(hash(raw)).ifPresent(RefreshToken::revoke);
    }

    private TokenPairResponse newPair(User user) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        var now = clock.instant();
        repository.save(new RefreshToken(hash(raw), user, now, now.plus(properties.refreshTtl())));
        return new TokenPairResponse(tokens.access(user), raw, "Bearer", properties.accessTtl().toSeconds());
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private ApiException invalid() {
        return new ApiException(401, "INVALID_REFRESH_TOKEN", "Refresh-токен недействителен или истёк");
    }
}
