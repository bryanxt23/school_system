package com.payroll.backend.facilities;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CleaningScheduleRepository extends JpaRepository<CleaningSchedule, Long> {
    List<CleaningSchedule> findAllByOrderByIdDesc();
    List<CleaningSchedule> findByAreaIdOrderByIdDesc(Long areaId);
}
