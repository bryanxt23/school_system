package com.payroll.backend.academics;

import jakarta.persistence.*;

@Entity
@Table(name = "sports")
public class Sport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;           // e.g. "Basketball"

    @Column(name = "coach_staff_id")
    private Long coachStaffId;      // nullable — Phase 2 will populate

    private String season;          // e.g. "Wet Season", "Dry Season"

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCoachStaffId() { return coachStaffId; }
    public void setCoachStaffId(Long coachStaffId) { this.coachStaffId = coachStaffId; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }
}
