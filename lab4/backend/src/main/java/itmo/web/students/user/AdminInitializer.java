package itmo.web.students.user;

import itmo.web.students.auth.dto.RegisterRequest;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);
    private final UserService service;
    private final Validator validator;
    private final String username, email, password;

    public AdminInitializer(UserService service, Validator validator,
                            @Value("${app.admin.username:}") String username,
                            @Value("${app.admin.email:}") String email,
                            @Value("${app.admin.password:}") String password) {
        this.service = service;
        this.validator = validator;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (username.isBlank() && email.isBlank() && password.isBlank()) return;
        RegisterRequest request = new RegisterRequest(username, email, password);
        if (!validator.validate(request).isEmpty())
            throw new IllegalStateException("Invalid ADMIN_USERNAME/ADMIN_EMAIL/ADMIN_PASSWORD configuration");
        if (service.isExists(request.username())) {
            if (service.findByUsername(request.username()).getRole() != Role.ADMIN)
                throw new IllegalStateException("Configured initial administrator username belongs to a USER");
            log.info("Initial administrator already exists, credentials are not changed");
            return;
        }
        service.createInitialAdmin(request.username(), request.email(), request.password());
        log.info("Initial administrator created");
    }
}
