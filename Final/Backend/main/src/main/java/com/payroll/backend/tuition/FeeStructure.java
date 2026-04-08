package com.payroll.backend.tuition;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "fee_structures",
       uniqueConstraints = @UniqueConstraint(columnNames = {"grade_level_id", "school_year_id"}))
public class FeeStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grade_level_id", nullable = false)
    private Long gradeLevelId;

    @Column(name = "school_year_id", nullable = false)
    private Long schoolYearId;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    /** Free-form line-item breakdown (JSON or human-readable). */
    @Column(length = 2000)
    private String breakdown;

    public Long getId() { return id; }

    public Long getGradeLevelId() { return gradeLevelId; }
    public void setGradeLevelId(Long gradeLevelId) { this.gradeLevelId = gradeLevelId; }

    public Long getSchoolYearId() { return schoolYearId; }
    public void setSchoolYearId(Long schoolYearId) { this.schoolYearId = schoolYearId; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getBreakdown() { return breakdown; }
    public void setBreakdown(String breakdown) { this.breakdown = breakdown; }
}
