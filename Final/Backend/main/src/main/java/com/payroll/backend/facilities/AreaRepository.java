package com.payroll.backend.facilities;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AreaRepository extends JpaRepository<Area, Long> {
    List<Area> findAllByOrderByNameAsc();
    List<Area> findByAssignedJanitorStaffIdOrderByNameAsc(Long staffId);
}
