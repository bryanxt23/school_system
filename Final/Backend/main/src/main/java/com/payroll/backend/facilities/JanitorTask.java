package com.payroll.backend.facilities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "janitor_tasks")
public class JanitorTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "area_id", nullable = false)
    private Long areaId;

    @Column(name = "janitor_staff_id")
    private Long janitorStaffId;

    @Column(name = "due_date")
    private LocalDate dueDate;

    /** PENDING / DONE */
    @Column(nullable = false, length = 16)
    private String status = "PENDING";

    private String notes;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        if (status == null || status.isBlank()) status = "PENDING";
    }

    public Long getId() { return id; }

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }

    public Long getJanitorStaffId() { return janitorStaffId; }
    public void setJanitorStaffId(Long janitorStaffId) { this.janitorStaffId = janitorStaffId; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
