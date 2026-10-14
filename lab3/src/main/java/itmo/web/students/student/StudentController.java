package itmo.web.students.student;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import itmo.web.students.error.ApiException;
import itmo.web.students.student.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@RestController
@RequestMapping(value = "/api/students", produces = MediaType.APPLICATION_JSON_VALUE)
public class StudentController {
    private final StudentService service;
    private final ObjectMapper mapper;
    private final Validator validator;

    public StudentController(StudentService service, ObjectMapper mapper, Validator validator) {
        this.service = service;
        this.mapper = mapper;
        this.validator = validator;
    }

    @GetMapping
    @Operation(summary = "Список студентов: фильтры, сортировка, пагинация")
    public StudentPageResponse list(@ModelAttribute StudentSearchRequest request) {
        validateSearch(request, true);
        return service.search(request);
    }

    @RequestMapping
    @Hidden
    public StudentPageResponse query(HttpServletRequest http) throws IOException,
            HttpMediaTypeNotSupportedException,
            HttpRequestMethodNotSupportedException {
        String method = http.getMethod();

        if ("POST".equals(method)) {
            throw new HttpMediaTypeNotSupportedException("Ожидается application/json");
        }

        if (!"QUERY".equals(method)) {
            throw new HttpRequestMethodNotSupportedException(method, List.of("GET", "HEAD", "POST", "QUERY", "OPTIONS"));
        }

        if (!http.getParameterMap().isEmpty()) {
            throw invalidQuery(Map.of("parameters", List.of("Передавайте параметры QUERY только в JSON-теле")));
        }

        requireJson(http);

        StudentSearchRequest request;
        try {
            request = mapper.readValue(http.getInputStream(), StudentSearchRequest.class);
        } catch (JsonProcessingException ex) {
            throw new HttpMessageNotReadableException("Invalid QUERY body", ex, new ServletServerHttpRequest(http));
        }

        if (request == null) {
            throw new ApiException(422, "VALIDATION_ERROR", "Ожидается JSON-объект");
        }

        validateSearch(request, false);
        return service.search(request);
    }

    @RequestMapping(method = RequestMethod.OPTIONS)
    @Hidden
    public ResponseEntity<Void> options() {
        return ResponseEntity.ok().header(HttpHeaders.ALLOW, "GET, HEAD, POST, QUERY, OPTIONS").build();
    }

    @GetMapping("/{isuId}")
    @Operation(summary = "Получить студента по ИСУ")
    public StudentResponse get(@PathVariable String isuId) {
        return service.get(parseId(isuId));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Создать студента (ADMIN)")
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody CreateStudentRequest request) {
        StudentResponse result = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(result.isuId()).toUri();
        return ResponseEntity.created(location).body(result);
    }

    @PatchMapping(value = "/{isuId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Частично изменить студента (ADMIN)")
    public StudentResponse patch(@PathVariable String isuId, @Valid @RequestBody PatchStudentRequest request) {
        return service.patch(parseId(isuId), request);
    }

    @DeleteMapping("/{isuId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Удалить студента (ADMIN)")
    public void delete(@PathVariable String isuId) {
        service.delete(parseId(isuId));
    }

    private Integer parseId(String value) {
        if (!value.matches("[1-9][0-9]{5}"))
            throw new ApiException(422, "INVALID_ISU_ID", "ИСУ ID должен содержать ровно 6 цифр", Map.of("isuId", List.of("Ожидается число от 100000 до 999999")));
        return Integer.valueOf(value);
    }

    private void validateSearch(StudentSearchRequest request, boolean queryParameters) {
        Map<String, List<String>> errors = new TreeMap<>();
        validator.validate(request).forEach(v -> errors.computeIfAbsent(v.getPropertyPath().toString(), k -> new ArrayList<>()).add(v.getMessage()));
        if (!errors.isEmpty()) {
            if (queryParameters) throw invalidQuery(errors);
            throw new ApiException(422, "VALIDATION_ERROR", "Проверьте введенные данные", errors);
        }
    }

    private ApiException invalidQuery(Object details) {
        return new ApiException(400, "INVALID_QUERY", "Некорректные параметры запроса", details);
    }

    private void requireJson(HttpServletRequest http)
            throws HttpMediaTypeNotSupportedException {

        String header = http.getContentType();

        if (header != null) {
            try {
                MediaType type = MediaType.parseMediaType(header);
                if (MediaType.APPLICATION_JSON.isCompatibleWith(type)) {
                    return;
                }
            } catch (IllegalArgumentException ignored) {
            }
        }

        throw new HttpMediaTypeNotSupportedException(
                "Ожидается application/json"
        );
    }
}
