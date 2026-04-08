package com.payroll.backend.people;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"student_id", "school_year_id", "semester_id"}))
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "school_year_id", nullable = false)
    private Long schoolYearId;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    /** ENROLLED / DROPPED / COMPLETED */
    @Column(nullable = false)
    private String status = "ENROLLED";

    @Column(name = "enrolled_at", nullable = false)
    private LocalDateTime enrolledAt;

    @PrePersist
    public void prePersist() {
        if (enrolledAt == null) enrolledAt = LocalDateTime.now();
        if (status == null || status.isBlank()) status = "ENROLLED";
    }

    public Long getId() { return id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getSchoolYearId() { return schoolYearId; }
    public void setSchoolYearId(Long schoolYearId) { this.schoolYearId = schoolYearId; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
}
