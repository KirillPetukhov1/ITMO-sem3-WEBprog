package itmo.web.students.auth;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.sql.Timestamp;
import java.time.Instant;


@Converter(autoApply = true)
public class InstantConverter implements AttributeConverter<Instant, Timestamp> {
    @Override
    public Timestamp convertToDatabaseColumn(Instant value) {
        return value == null ? null : Timestamp.from(value);
    }

    @Override
    public Instant convertToEntityAttribute(Timestamp value) {
        return value == null ? null : value.toInstant();
    }
}
