package itmo.web.students.student.dto;

import java.time.LocalDate;

public record StudentResponse(Integer isuId, String fullName, String group, Integer dormitory,
                              Integer room, LocalDate settlementDate, Boolean isForeigner, String notes) {
}
