package com.payroll.backend.academics;

import jakarta.persistence.*;

@Entity
@Table(name = "class_offerings",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"semester_id", "section_id", "subject_id"}))
public class ClassOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "semester_id", nullable = false)
    private Long semesterId;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "teacher_staff_id")
    private Long teacherStaffId;

    /** Free-form schedule string e.g. "Mon/Wed 08:00-09:00" */
    private String schedule;

    private String room;

    public Long getId() { return id; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public Long getSectionId() { return sectionId; }
    public void setSectionId(Long sectionId) { this.sectionId = sectionId; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getTeacherStaffId() { return teacherStaffId; }
    public void setTeacherStaffId(Long teacherStaffId) { this.teacherStaffId = teacherStaffId; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
}
