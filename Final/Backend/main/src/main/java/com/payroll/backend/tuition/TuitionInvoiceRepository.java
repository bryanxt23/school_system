package com.payroll.backend.tuition;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TuitionInvoiceRepository extends JpaRepository<TuitionInvoice, Long> {
    List<TuitionInvoice> findAllByOrderByIdDesc();
    List<TuitionInvoice> findByStudentIdOrderByIdDesc(Long studentId);
    List<TuitionInvoice> findBySemesterIdOrderByIdDesc(Long semesterId);
    Optional<TuitionInvoice> findByStudentIdAndSchoolYearIdAndSemesterId(
            Long studentId, Long schoolYearId, Long semesterId);
}
