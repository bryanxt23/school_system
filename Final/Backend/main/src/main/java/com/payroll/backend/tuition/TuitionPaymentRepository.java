package com.payroll.backend.tuition;

import org.springframework.data.jpa.repository.JpaRepository;
import java.math.BigDecimal;
import java.util.List;

public interface TuitionPaymentRepository extends JpaRepository<TuitionPayment, Long> {
    List<TuitionPayment> findAllByOrderByPaidAtDesc();
    List<TuitionPayment> findByInvoiceIdOrderByPaidAtDesc(Long invoiceId);

    default BigDecimal sumByInvoiceId(Long invoiceId) {
        return findByInvoiceIdOrderByPaidAtDesc(invoiceId).stream()
                .map(TuitionPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
