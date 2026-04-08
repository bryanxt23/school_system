package com.payroll.backend.people;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParentStudentRepository extends JpaRepository<ParentStudent, Long> {
    List<ParentStudent> findAllByOrderByIdDesc();
    List<ParentStudent> findByParentId(Long parentId);
    List<ParentStudent> findByStudentId(Long studentId);
    boolean existsByParentIdAndStudentId(Long parentId, Long studentId);
}
