package com.payroll.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GradeLevelRepository extends JpaRepository<GradeLevel, Long> {
    List<GradeLevel> findAllByOrderByOrderingAscNameAsc();
    List<GradeLevel> findByFacultyIdOrderByOrderingAscNameAsc(Long facultyId);
}
