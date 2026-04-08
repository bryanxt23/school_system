package com.payroll.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchoolYearRepository extends JpaRepository<SchoolYear, Long> {
    List<SchoolYear> findAllByOrderByLabelDesc();
    boolean existsByLabel(String label);
}
