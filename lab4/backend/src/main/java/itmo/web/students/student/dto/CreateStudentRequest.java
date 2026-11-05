package itmo.web.students.student.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.OptBoolean;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateStudentRequest(
        @NotNull(message = "Обязательное поле") @Min(value = 100000, message = "Ожидается 6 цифр") @Max(value = 999999, message = "Ожидается 6 цифр") Integer isuId,
        @NotNull(message = "Обязательное поле") @Size(min = 5, max = 100, message = "Длина ФИО должна быть от 5 до 100 символов") String fullName,
        @NotNull(message = "Обязательное поле") @Pattern(regexp = "[A-Z][0-9]{4}", message = "Ожидается заглавная латинская буква и 4 цифры") String group,
        @NotNull(message = "Обязательное поле") @Min(1) @Max(99) Integer dormitory,
        @NotNull(message = "Обязательное поле") @Min(1) @Max(9999) Integer room,
        @NotNull(message = "Обязательное поле") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "uuuu-MM-dd", lenient = OptBoolean.FALSE) LocalDate settlementDate,
        @NotNull(message = "Обязательное поле") Boolean isForeigner,
        @Size(max = 500) String notes
) {

    @AssertTrue(message = "Дата должна быть не раньше 2000-01-01")
    @JsonIgnore
    public boolean isSettlementDateValid() {
        return settlementDate == null || !settlementDate.isBefore(LocalDate.of(2000, 1, 1));
    }

    public CreateStudentRequest {
        fullName = fullName == null ? null : fullName.strip();
        group = group == null ? null : group.strip();
        notes = notes == null ? "" : notes.strip();
    }
}
