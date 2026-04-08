package com.payroll.backend.academics;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "school_years")
public class SchoolYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String label;          // e.g. "2026-2027"

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active = false;

    public Long getId() { return id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
