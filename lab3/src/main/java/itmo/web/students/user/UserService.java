package itmo.web.students.user;

import itmo.web.students.error.ApiException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository repository;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repository, PasswordEncoder encoder) {
        this.repository = repository;
        this.encoder = encoder;
    }

    public User findByUsername(String username) {
        return repository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public boolean isExists(String username) {
        return repository.existsByUsername(username);
    }

    @Transactional
    public User register(String username, String email, String password) {
        return create(username, email, password, Role.USER);
    }

    @Transactional
    public void createInitialAdmin(String username, String email, String password) {
        if (!repository.existsByUsername(username)) create(username, email, password, Role.ADMIN);
    }

    private User create(String username, String email, String password, Role role) {
        if (repository.existsByUsername(username))
            throw new ApiException(409, "USERNAME_CONFLICT", "Имя пользователя уже занято", Map.of("username", List.of("Имя пользователя уже занято")));
        if (repository.existsByEmail(email))
            throw new ApiException(409, "EMAIL_CONFLICT", "Email уже используется", Map.of("email", List.of("Email уже используется")));
        try {
            return repository.saveAndFlush(new User(username, email, encoder.encode(password), role));
        } catch (DataIntegrityViolationException ex) {
            throw new ApiException(409, "USER_CONFLICT", "Имя пользователя или email уже используется");
        }
    }
}
