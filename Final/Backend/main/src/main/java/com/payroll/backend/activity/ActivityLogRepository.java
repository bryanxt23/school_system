package com.payroll.backend.activity;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop20ByOrderByCreatedAtDesc();
    List<ActivityLog> findAllByOrderByCreatedAtDesc();
    List<ActivityLog> findByCategoryOrderByCreatedAtDesc(String category);
}
