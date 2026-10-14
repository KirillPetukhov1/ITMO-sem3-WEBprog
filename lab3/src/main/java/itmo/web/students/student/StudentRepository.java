package itmo.web.students.student;

import jakarta.persistence.LockModeType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public interface StudentRepository
        extends JpaRepository<Student, Integer>,
        JpaSpecificationExecutor<Student> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Student s where s.isuId = :id")
    Optional<Student> findForUpdate(@Param("id") Integer id);

    default Page<Student> search(
            String fullName,
            String notes,
            String group,
            Integer isuId,
            Integer dormitory,
            Integer room,
            LocalDate settlementDate,
            Boolean isForeigner,
            Pageable pageable
    ) {
        Specification<Student> specification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (fullName != null) {
                predicates.add(cb.like(cb.lower(root.<String>get("fullName")), fullName, '!'));
            }

            if (notes != null) {
                predicates.add(cb.like(cb.lower(root.<String>get("notes")), notes, '!'));
            }

            if (group != null) {
                predicates.add(cb.equal(root.<String>get("groupName"), group));
            }

            if (isuId != null) {
                predicates.add(cb.equal(root.<Integer>get("isuId"), isuId));
            }

            if (dormitory != null) {
                predicates.add(cb.equal(root.<Integer>get("dormitory"), dormitory));
            }

            if (room != null) {
                predicates.add(cb.equal(root.<Integer>get("room"), room));
            }

            if (settlementDate != null) {
                predicates.add(
                        cb.equal(root.<LocalDate>get("settlementDate"), settlementDate)
                );
            }

            if (isForeigner != null) {
                predicates.add(cb.equal(root.<Boolean>get("isForeigner"), isForeigner));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return findAll(specification, pageable);
    }
}