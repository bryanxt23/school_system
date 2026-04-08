package com.payroll.backend.tuition;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tuition_payments")
public class TuitionPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    /** CASH / BANK / GCASH / CARD / OTHER */
    private String method;

    @Column(name = "reference_no")
    private String referenceNo;

    @Column(name = "received_by_staff_id")
    private Long receivedByStaffId;

    @PrePersist
    public void prePersist() {
        if (paidAt == null) paidAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String referenceNo) { this.referenceNo = referenceNo; }

    public Long getReceivedByStaffId() { return receivedByStaffId; }
    public void setReceivedByStaffId(Long receivedByStaffId) { this.receivedByStaffId = receivedByStaffId; }
}
