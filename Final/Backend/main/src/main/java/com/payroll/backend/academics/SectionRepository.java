package com.payroll.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findAllByOrderByNameAsc();
    List<Section> findBySchoolYearIdOrderByNameAsc(Long schoolYearId);
    List<Section> findByGradeLevelIdOrderByNameAsc(Long gradeLevelId);
}
