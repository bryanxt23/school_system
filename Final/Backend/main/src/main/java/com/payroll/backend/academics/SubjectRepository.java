package com.payroll.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findAllByOrderByCodeAsc();
    List<Subject> findByGradeLevelIdOrderByCodeAsc(Long gradeLevelId);
    List<Subject> findByFacultyIdOrderByCodeAsc(Long facultyId);
    boolean existsByCode(String code);
}
