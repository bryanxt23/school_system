package com.payroll.backend.people;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_number", unique = true, nullable = false)
    private String studentNumber;

    @Column(nullable = false)
    private String firstName;

    private String middleName;

    @Column(nullable = false)
    private String lastName;

    private LocalDate birthdate;
    private String sex;            // Male / Female
    private String address;
    private String contact;
    private String photoUrl;

    /** Current section (denormalized for fast lookup); Phase 4 also keeps Enrollment rows. */
    @Column(name = "current_section_id")
    private Long currentSectionId;

    /** ENROLLED / GRADUATED / INACTIVE */
    @Column(nullable = false)
    private String status = "ENROLLED";

    public Long getId() { return id; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public LocalDate getBirthdate() { return birthdate; }
    public void setBirthdate(LocalDate birthdate) { this.birthdate = birthdate; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public Long getCurrentSectionId() { return currentSectionId; }
    public void setCurrentSectionId(Long currentSectionId) { this.currentSectionId = currentSectionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
