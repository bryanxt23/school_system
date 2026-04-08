package com.payroll.backend.academics;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;           // e.g. "MATH7"

    @Column(nullable = false)
    private String title;          // e.g. "Mathematics 7"

    private Double units;          // e.g. 1.0 / 1.5

    @Column(name = "grade_level_id")
    private Long gradeLevelId;

    @Column(name = "faculty_id")
    private Long facultyId;

    public Long getId() { return id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getUnits() { return units; }
    public void setUnits(Double units) { this.units = units; }

    public Long getGradeLevelId() { return gradeLevelId; }
    public void setGradeLevelId(Long gradeLevelId) { this.gradeLevelId = gradeLevelId; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
}
