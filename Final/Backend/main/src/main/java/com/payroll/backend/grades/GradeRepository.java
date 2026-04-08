package com.payroll.backend.grades;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByClassOfferingId(Long classOfferingId);
    List<Grade> findByStudentIdOrderByEncodedAtDesc(Long studentId);
    List<Grade> findByStudentIdAndClassOfferingId(Long studentId, Long classOfferingId);
    Optional<Grade> findByStudentIdAndClassOfferingIdAndPeriod(
            Long studentId, Long classOfferingId, String period);
}
