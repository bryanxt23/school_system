package com.payroll.backend.academics;

import jakarta.persistence.*;

@Entity
@Table(name = "faculties")
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;           // e.g. "Senior High School", "Junior High School"

    @Column(name = "head_staff_id")
    private Long headStaffId;       // nullable — Phase 2 will populate

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getHeadStaffId() { return headStaffId; }
    public void setHeadStaffId(Long headStaffId) { this.headStaffId = headStaffId; }
}
