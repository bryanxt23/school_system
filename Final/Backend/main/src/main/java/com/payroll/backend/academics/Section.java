package com.payroll.backend.academics;

import jakarta.persistence.*;

@Entity
@Table(name = "sections")
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;           // e.g. "St. Therese"

    @Column(name = "grade_level_id", nullable = false)
    private Long gradeLevelId;

    @Column(name = "school_year_id", nullable = false)
    private Long schoolYearId;

    @Column(name = "adviser_staff_id")
    private Long adviserStaffId;    // nullable — Phase 2 will populate

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getGradeLevelId() { return gradeLevelId; }
    public void setGradeLevelId(Long gradeLevelId) { this.gradeLevelId = gradeLevelId; }

    public Long getSchoolYearId() { return schoolYearId; }
    public void setSchoolYearId(Long schoolYearId) { this.schoolYearId = schoolYearId; }

    public Long getAdviserStaffId() { return adviserStaffId; }
    public void setAdviserStaffId(Long adviserStaffId) { this.adviserStaffId = adviserStaffId; }
}
