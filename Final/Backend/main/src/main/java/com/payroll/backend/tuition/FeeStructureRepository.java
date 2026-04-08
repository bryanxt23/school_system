package com.payroll.backend.tuition;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findAllByOrderByIdDesc();
    List<FeeStructure> findBySchoolYearIdOrderByIdDesc(Long schoolYearId);
    Optional<FeeStructure> findByGradeLevelIdAndSchoolYearId(Long gradeLevelId, Long schoolYearId);
}
