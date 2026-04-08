package com.payroll.backend.books;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentBookPurchaseRepository extends JpaRepository<StudentBookPurchase, Long> {
    List<StudentBookPurchase> findAllByOrderByPurchasedAtDesc();
    List<StudentBookPurchase> findByStudentIdOrderByPurchasedAtDesc(Long studentId);
}
