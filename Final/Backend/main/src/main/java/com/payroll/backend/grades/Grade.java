package com.payroll.backend.grades;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"student_id", "class_offering_id", "period"}))
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "class_offering_id", nullable = false)
    private Long classOfferingId;

    /** MIDTERM or FINAL */
    @Column(nullable = false, length = 16)
    private String period;

    @Column(precision = 6, scale = 2)
    private BigDecimal score;

    private String remarks;

    @Column(name = "encoded_by_staff_id")
    private Long encodedByStaffId;

    @Column(name = "encoded_at", nullable = false)
    private LocalDateTime encodedAt;

    @PrePersist
    @PreUpdate
    public void touch() {
        encodedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getClassOfferingId() { return classOfferingId; }
    public void setClassOfferingId(Long classOfferingId) { this.classOfferingId = classOfferingId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Long getEncodedByStaffId() { return encodedByStaffId; }
    public void setEncodedByStaffId(Long encodedByStaffId) { this.encodedByStaffId = encodedByStaffId; }

    public LocalDateTime getEncodedAt() { return encodedAt; }
    public void setEncodedAt(LocalDateTime encodedAt) { this.encodedAt = encodedAt; }
}
