package com.payroll.backend.people;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findAllByOrderByLastNameAscFirstNameAsc();
    List<Student> findByCurrentSectionIdOrderByLastNameAsc(Long sectionId);
    List<Student> findByStatusOrderByLastNameAsc(String status);
    boolean existsByStudentNumber(String studentNumber);
}
