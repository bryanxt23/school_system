package com.payroll.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SportRepository extends JpaRepository<Sport, Long> {
    List<Sport> findAllByOrderByNameAsc();
    boolean existsByName(String name);
}
