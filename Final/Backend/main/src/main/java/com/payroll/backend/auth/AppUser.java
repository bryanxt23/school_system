package com.payroll.backend.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    /** Legacy: links this user to an employee record by employee code. */
    @Column(name = "employee_code")
    private String employeeCode;

    /**
     * Generic link to a domain entity. Phase 3 will switch the auth flow to
     * use these instead of employeeCode. Values: STAFF / STUDENT / PARENT.
     */
    @Column(name = "linked_entity_type")
    private String linkedEntityType;

    @Column(name = "linked_entity_id")
    private Long linkedEntityId;

    public Long getId() { return id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getLinkedEntityType() { return linkedEntityType; }
    public void setLinkedEntityType(String linkedEntityType) { this.linkedEntityType = linkedEntityType; }

    public Long getLinkedEntityId() { return linkedEntityId; }
    public void setLinkedEntityId(Long linkedEntityId) { this.linkedEntityId = linkedEntityId; }
}
