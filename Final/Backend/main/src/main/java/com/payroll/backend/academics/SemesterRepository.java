package com.payroll.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
    List<Semester> findBySchoolYearIdOrderByLabelAsc(Long schoolYearId);
    List<Semester> findAllByOrderByIdDesc();
}
