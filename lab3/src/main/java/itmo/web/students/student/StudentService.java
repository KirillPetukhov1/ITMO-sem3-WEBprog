package itmo.web.students.student;

import itmo.web.students.error.ApiException;
import itmo.web.students.student.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class StudentService {
    private static final Logger log = LoggerFactory.getLogger(StudentService.class);
    private final StudentRepository repository;
    private final StudentMapper mapper;

    public StudentService(StudentRepository repository, StudentMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public StudentResponse get(Integer id) {
        return mapper.toResponse(find(id));
    }

    public StudentPageResponse search(StudentSearchRequest r) {
        String sortProperty = r.sortBy().equals("group")
                ? "groupName"
                : r.sortBy();

        Sort.Order order = new Sort.Order(
                Sort.Direction.fromString(r.order()),
                sortProperty
        );

        if (Set.of("fullName", "groupName", "notes").contains(sortProperty)) {
            order = order.ignoreCase();
        }

        Sort sort = Sort.by(order);

        if (!sortProperty.equals("isuId")) {
            sort = sort.and(Sort.by("isuId"));
        }

        Page<Student> first = search(r, PageRequest.of(0, r.page_size(), sort));
        long totalPages = Math.max(1L, (first.getTotalElements() + r.page_size() - 1) / r.page_size());

        if (r.page() > totalPages)
            throw new ApiException(404, "PAGE_NOT_FOUND", "Страница не существует", Map.of("total_pages", totalPages));

        long offset = (long) (r.page() - 1) * r.page_size();

        if (offset > Integer.MAX_VALUE)
            throw new ApiException(400, "INVALID_QUERY", "Слишком большое смещение страницы");

        Page<Student> page = r.page() == 1 ? first : search(r, PageRequest.of(r.page() - 1, r.page_size(), sort));

        return new StudentPageResponse(first.getTotalElements(), r.page(), r.page_size(), totalPages,
                r.page() < totalPages ? r.page() + 1 : null, r.page() > 1 ? r.page() - 1 : null,
                page.getContent().stream().map(mapper::toResponse).toList());
    }

    private Page<Student> search(StudentSearchRequest r, Pageable page) {
        return repository.search(like(r.fullName()), like(r.notes()), r.group(), r.isuId(), r.dormitory(),
                r.room(), r.settlementDate(), r.isForeigner(), page);
    }

    private String like(String value) {
        return value == null ? null : "%" + value.toLowerCase(Locale.ROOT)
                                            .replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public StudentResponse create(CreateStudentRequest request) {
        if (repository.existsById(request.isuId())) throw conflict();
        try {
            Student student = repository.saveAndFlush(mapper.toEntity(request));
            log.info("Student created: {}", student.getIsuId());
            return mapper.toResponse(student);
        } catch (DataIntegrityViolationException ex) {
            throw conflict();
        }
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public StudentResponse patch(Integer id, PatchStudentRequest request) {
        Student student = repository.findForUpdate(id).orElseThrow(this::notFound);
        if (request.isuId() != null) throw new ApiException(422, "IMMUTABLE_ISU_ID", "ИСУ ID нельзя изменить",
                Map.of("isuId", List.of("Идентификатор студента неизменяем")));
        mapper.apply(student, request);
        repository.flush();
        log.info("Student updated: {}", id);

        return mapper.toResponse(student);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(Integer id) {
        Student student = repository.findForUpdate(id).orElseThrow(this::notFound);
        repository.delete(student);
        log.info("Student deleted: {}", id);
    }

    private Student find(Integer id) {
        return repository.findById(id).orElseThrow(this::notFound);
    }

    private ApiException notFound() {
        return new ApiException(404, "STUDENT_NOT_FOUND", "Студент не найден");
    }

    private ApiException conflict() {
        return new ApiException(409, "ISU_CONFLICT", "ИСУ ID уже существует",
                Map.of("isuId", List.of("Студент с таким ИСУ ID уже существует")));
    }
}
