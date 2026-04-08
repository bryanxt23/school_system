package com.payroll.backend.announcements;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    private String body;

    /**
     * Audience filter string. Supported forms:
     *   ALL
     *   STUDENTS
     *   PARENTS
     *   STAFF                       (any non-Admin staff role)
     *   ROLE:Teacher | ROLE:Janitor | ROLE:SecurityGuard | ROLE:Admin
     *   SECTION:{id}                (students in that section + their parents)
     *   GRADELEVEL:{id}             (students at that grade level + their parents)
     */
    @Column(nullable = false)
    private String audience = "ALL";

    @Column(name = "posted_by_user_id")
    private Long postedByUserId;

    @Column(name = "posted_by_username")
    private String postedByUsername;

    @Column(name = "posted_at", nullable = false)
    private LocalDateTime postedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @PrePersist
    public void prePersist() {
        if (postedAt == null) postedAt = LocalDateTime.now();
        if (audience == null || audience.isBlank()) audience = "ALL";
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }

    public Long getPostedByUserId() { return postedByUserId; }
    public void setPostedByUserId(Long postedByUserId) { this.postedByUserId = postedByUserId; }

    public String getPostedByUsername() { return postedByUsername; }
    public void setPostedByUsername(String postedByUsername) { this.postedByUsername = postedByUsername; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
