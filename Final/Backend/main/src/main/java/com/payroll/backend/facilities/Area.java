package com.payroll.backend.facilities;

import jakarta.persistence.*;

@Entity
@Table(name = "areas")
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String building;
    private String floor;

    @Column(name = "assigned_janitor_staff_id")
    private Long assignedJanitorStaffId;

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }

    public Long getAssignedJanitorStaffId() { return assignedJanitorStaffId; }
    public void setAssignedJanitorStaffId(Long assignedJanitorStaffId) { this.assignedJanitorStaffId = assignedJanitorStaffId; }
}
