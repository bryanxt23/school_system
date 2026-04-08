package com.payroll.backend.facilities;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JanitorTaskRepository extends JpaRepository<JanitorTask, Long> {
    List<JanitorTask> findAllByOrderByDueDateAscIdAsc();
    List<JanitorTask> findByJanitorStaffIdOrderByDueDateAscIdAsc(Long staffId);
    List<JanitorTask> findByAreaIdOrderByDueDateAscIdAsc(Long areaId);
    List<JanitorTask> findByStatusOrderByDueDateAscIdAsc(String status);
    List<JanitorTask> findByJanitorStaffIdAndStatusOrderByDueDateAscIdAsc(Long staffId, String status);
}
