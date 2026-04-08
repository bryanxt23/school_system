package com.payroll.backend.people;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findAllByOrderByEnrolledAtDesc();
    List<Enrollment> findByStudentIdOrderByEnrolledAtDesc(Long studentId);
    List<Enrollment> findBySectionIdOrderByEnrolledAtDesc(Long sectionId);
    List<Enrollment> findBySchoolYearIdAndSemesterIdOrderByEnrolledAtDesc(Long schoolYearId, Long semesterId);
}
