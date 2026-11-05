package itmo.web.students.student.dto;

import java.util.List;

public record StudentPageResponse(long count, int page, int page_size, long total_pages,
                                  Integer next, Integer previous, List<StudentResponse> results) {
}
