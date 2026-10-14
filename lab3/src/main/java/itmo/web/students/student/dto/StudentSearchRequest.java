package itmo.web.students.student.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.OptBoolean;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record StudentSearchRequest(
        @Size(min = 1, max = 100) String fullName,
        @Pattern(regexp = "[A-Z][0-9]{4}") String group,
        @Min(100000) @Max(999999) Integer isuId,
        @Min(1) @Max(99) Integer dormitory,
        @Min(1) @Max(9999) Integer room,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "uuuu-MM-dd", lenient = OptBoolean.FALSE) LocalDate settlementDate,
        Boolean isForeigner,
        @Size(min = 1, max = 500) String notes,
        @Pattern(regexp = "fullName|group|isuId|dormitory|room|settlementDate|isForeigner|notes") String sortBy,
        @Pattern(regexp = "asc|desc") String order,
        @Min(1) Integer page,
        @Min(1) @Max(100) Integer page_size
) {
    public StudentSearchRequest {
        fullName = fullName == null ? null : fullName.strip();
        group = group == null ? null : group.strip();
        notes = notes == null ? null : notes.strip();
        sortBy = sortBy == null ? "isuId" : sortBy;
        order = order == null ? "asc" : order;
        page = page == null ? 1 : page;
        page_size = page_size == null ? 10 : page_size;
    }
}
