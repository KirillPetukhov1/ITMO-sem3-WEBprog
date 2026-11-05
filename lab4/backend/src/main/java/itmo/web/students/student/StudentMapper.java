package itmo.web.students.student;

import itmo.web.students.student.dto.CreateStudentRequest;
import itmo.web.students.student.dto.PatchStudentRequest;
import itmo.web.students.student.dto.StudentResponse;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {
    public StudentResponse toResponse(Student s) {
        return new StudentResponse(s.getIsuId(), s.getFullName(), s.getGroupName(), s.getDormitory(),
                s.getRoom(), s.getSettlementDate(), s.getIsForeigner(), s.getNotes());
    }

    public Student toEntity(CreateStudentRequest r) {
        Student s = new Student();
        s.setIsuId(r.isuId());
        s.setFullName(r.fullName());
        s.setGroupName(r.group());
        s.setDormitory(r.dormitory());
        s.setRoom(r.room());
        s.setSettlementDate(r.settlementDate());
        s.setIsForeigner(r.isForeigner());
        s.setNotes(r.notes());
        return s;
    }

    public void apply(Student s, PatchStudentRequest r) {
        if (r.fullName() != null) s.setFullName(r.fullName());
        if (r.group() != null) s.setGroupName(r.group());
        if (r.dormitory() != null) s.setDormitory(r.dormitory());
        if (r.room() != null) s.setRoom(r.room());
        if (r.settlementDate() != null) s.setSettlementDate(r.settlementDate());
        if (r.isForeigner() != null) s.setIsForeigner(r.isForeigner());
        if (r.notes() != null) s.setNotes(r.notes());
    }
}
