package com.payroll.backend.academics;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "semesters")
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "school_year_id", nullable = false)
    private Long schoolYearId;

    @Column(nullable = false)
    private String label;          // "1st" or "2nd"

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active = false;

    public Long getId() { return id; }

    public Long getSchoolYearId() { return schoolYearId; }
    public void setSchoolYearId(Long schoolYearId) { this.schoolYearId = schoolYearId; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
