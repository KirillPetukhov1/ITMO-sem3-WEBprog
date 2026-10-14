package itmo.web.students.auth;

import itmo.web.students.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
    @Column(nullable = false)
    private boolean revoked;

    public RefreshToken() {
    }

    public RefreshToken(String tokenHash, User user, Instant createdAt, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.user = user;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public User getUser() {
        return user;
    }

    public boolean isValid(Instant now) {
        return !revoked && expiresAt.isAfter(now);
    }

    public void revoke() {
        revoked = true;
    }
}
