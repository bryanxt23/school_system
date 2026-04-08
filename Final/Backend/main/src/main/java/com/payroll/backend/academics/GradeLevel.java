package com.payroll.backend.academics;

import jakarta.persistence.*;

@Entity
@Table(name = "grade_levels")
public class GradeLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;           // e.g. "Grade 7", "Grade 12"

    @Column(name = "faculty_id")
    private Long facultyId;

    @Column(nullable = false)
    private int ordering = 0;       // sort order

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public int getOrdering() { return ordering; }
    public void setOrdering(int ordering) { this.ordering = ordering; }
}
