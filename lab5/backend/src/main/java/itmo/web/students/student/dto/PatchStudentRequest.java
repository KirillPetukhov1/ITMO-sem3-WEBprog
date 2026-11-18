package itmo.web.students.student.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.OptBoolean;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record PatchStudentRequest(
        @Min(value = 100000, message = "Ожидается 6 цифр") @Max(value = 999999, message = "Ожидается 6 цифр") Integer isuId,
        @Size(min = 5, max = 100, message = "Длина ФИО должна быть от 5 до 100 символов") String fullName,
        @Pattern(regexp = "[A-Z][0-9]{4}", message = "Ожидается заглавная латинская буква и 4 цифры") String group,
        @Min(1) @Max(99) Integer dormitory,
        @Min(1) @Max(9999) Integer room,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "uuuu-MM-dd", lenient = OptBoolean.FALSE) LocalDate settlementDate,
        Boolean isForeigner,
        @Size(max = 500) String notes
) {

    @AssertTrue(message = "Дата должна быть не раньше 2000-01-01")
    @JsonIgnore
    public boolean isSettlementDateValid() {
        return settlementDate == null || !settlementDate.isBefore(LocalDate.of(2000, 1, 1));
    }

    public PatchStudentRequest {
        fullName = fullName == null ? null : fullName.strip();
        group = group == null ? null : group.strip();
        notes = notes == null ? null : notes.strip();
    }
}
