package com.payroll.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassOfferingRepository extends JpaRepository<ClassOffering, Long> {
    List<ClassOffering> findAllByOrderByIdDesc();
    List<ClassOffering> findBySemesterIdOrderByIdDesc(Long semesterId);
    List<ClassOffering> findBySectionIdOrderByIdDesc(Long sectionId);
    List<ClassOffering> findByTeacherStaffIdOrderByIdDesc(Long teacherStaffId);
    List<ClassOffering> findBySemesterIdAndSectionIdOrderByIdDesc(Long semesterId, Long sectionId);
    List<ClassOffering> findBySemesterIdAndTeacherStaffIdOrderByIdDesc(Long semesterId, Long teacherStaffId);
}
