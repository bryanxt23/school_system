package com.payroll.backend.people;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentSportRepository extends JpaRepository<StudentSport, Long> {
    List<StudentSport> findAllByOrderByIdDesc();
    List<StudentSport> findByStudentIdOrderByIdDesc(Long studentId);
    List<StudentSport> findBySportIdOrderByIdDesc(Long sportId);
}
