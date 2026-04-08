package com.payroll.backend.books;

import jakarta.persistence.*;

@Entity
@Table(name = "required_books",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"subject_id", "book_id", "school_year_id"}))
public class RequiredBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "school_year_id", nullable = false)
    private Long schoolYearId;

    @Column(nullable = false)
    private boolean mandatory = true;

    public Long getId() { return id; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public Long getSchoolYearId() { return schoolYearId; }
    public void setSchoolYearId(Long schoolYearId) { this.schoolYearId = schoolYearId; }

    public boolean isMandatory() { return mandatory; }
    public void setMandatory(boolean mandatory) { this.mandatory = mandatory; }
}
