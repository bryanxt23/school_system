package com.payroll.backend.books;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_book_purchases",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "book_id"}))
public class StudentBookPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "purchased_at", nullable = false)
    private LocalDateTime purchasedAt;

    @Column(name = "received_by_staff_id")
    private Long receivedByStaffId;

    @PrePersist
    public void prePersist() {
        if (purchasedAt == null) purchasedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getPurchasedAt() { return purchasedAt; }
    public void setPurchasedAt(LocalDateTime purchasedAt) { this.purchasedAt = purchasedAt; }

    public Long getReceivedByStaffId() { return receivedByStaffId; }
    public void setReceivedByStaffId(Long receivedByStaffId) { this.receivedByStaffId = receivedByStaffId; }
}
