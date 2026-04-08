package com.payroll.backend.facilities;

import jakarta.persistence.*;

@Entity
@Table(name = "cleaning_schedules")
public class CleaningSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "area_id", nullable = false)
    private Long areaId;

    /** MONDAY..SUNDAY or DAILY */
    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek;

    /** Free-form e.g. "08:00-09:00" */
    @Column(name = "time_slot")
    private String timeSlot;

    /** WEEKLY / DAILY / BIWEEKLY / MONTHLY */
    private String frequency = "WEEKLY";

    public Long getId() { return id; }

    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
}
