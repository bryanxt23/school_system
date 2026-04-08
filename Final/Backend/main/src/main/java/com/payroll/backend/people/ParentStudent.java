package com.payroll.backend.people;

import jakarta.persistence.*;

@Entity
@Table(name = "parent_student",
       uniqueConstraints = @UniqueConstraint(columnNames = {"parent_id", "student_id"}))
public class ParentStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id", nullable = false)
    private Long parentId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    /** Father / Mother / Guardian / Other */
    @Column(nullable = false)
    private String relationship;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    public Long getId() { return id; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public boolean isPrimary() { return primary; }
    public void setPrimary(boolean primary) { this.primary = primary; }
}
