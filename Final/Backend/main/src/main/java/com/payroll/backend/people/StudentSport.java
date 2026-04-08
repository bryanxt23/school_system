package com.payroll.backend.people;

import jakarta.persistence.*;

@Entity
@Table(name = "student_sports",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"student_id", "sport_id", "school_year_id"}))
public class StudentSport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "sport_id", nullable = false)
    private Long sportId;

    @Column(name = "school_year_id", nullable = false)
    private Long schoolYearId;

    @Column(name = "jersey_number")
    private String jerseyNumber;

    private String position;

    public Long getId() { return id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getSportId() { return sportId; }
    public void setSportId(Long sportId) { this.sportId = sportId; }

    public Long getSchoolYearId() { return schoolYearId; }
    public void setSchoolYearId(Long schoolYearId) { this.schoolYearId = schoolYearId; }

    public String getJerseyNumber() { return jerseyNumber; }
    public void setJerseyNumber(String jerseyNumber) { this.jerseyNumber = jerseyNumber; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
}
