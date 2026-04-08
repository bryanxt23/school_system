package com.payroll.backend.tuition;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/tuition-payments")
public class TuitionPaymentController {

    private final TuitionPaymentRepository repo;
    private final TuitionInvoiceRepository invoiceRepo;

    public TuitionPaymentController(TuitionPaymentRepository repo,
                                    TuitionInvoiceRepository invoiceRepo) {
        this.repo = repo;
        this.invoiceRepo = invoiceRepo;
    }

    @GetMapping
    public List<TuitionPayment> list(@RequestParam(required = false) Long invoiceId) {
        if (invoiceId != null) return repo.findByInvoiceIdOrderByPaidAtDesc(invoiceId);
        return repo.findAllByOrderByPaidAtDesc();
    }

    @PostMapping
    public TuitionPayment create(@RequestBody TuitionPayment body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getInvoiceId() == null || body.getAmount() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invoiceId and amount required");
        TuitionInvoice inv = invoiceRepo.findById(body.getInvoiceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        // Stamp cashier from header
        String linkedId = req.getHeader("X-Linked-Entity-Id");
        if (linkedId != null && !linkedId.isBlank()) {
            try { body.setReceivedByStaffId(Long.valueOf(linkedId)); } catch (NumberFormatException ignored) {}
        }

        TuitionPayment saved = repo.save(body);
        recalcInvoiceStatus(inv);
        return saved;
    }

    @PutMapping("/{id}")
    public TuitionPayment update(@PathVariable Long id, @RequestBody TuitionPayment body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        TuitionPayment p = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getAmount() != null) p.setAmount(body.getAmount());
        if (body.getMethod() != null) p.setMethod(body.getMethod());
        p.setReferenceNo(body.getReferenceNo());
        TuitionPayment saved = repo.save(p);
        invoiceRepo.findById(p.getInvoiceId()).ifPresent(this::recalcInvoiceStatus);
        return saved;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        TuitionPayment p = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Long invoiceId = p.getInvoiceId();
        repo.deleteById(id);
        invoiceRepo.findById(invoiceId).ifPresent(this::recalcInvoiceStatus);
    }

    /** UNPAID / PARTIAL / PAID based on the sum of payments. */
    private void recalcInvoiceStatus(TuitionInvoice inv) {
        BigDecimal paid = repo.sumByInvoiceId(inv.getId());
        BigDecimal amount = inv.getAmount() == null ? BigDecimal.ZERO : inv.getAmount();
        String status;
        if (paid.compareTo(BigDecimal.ZERO) <= 0) {
            status = "UNPAID";
        } else if (paid.compareTo(amount) >= 0) {
            status = "PAID";
        } else {
            status = "PARTIAL";
        }
        if (!status.equals(inv.getStatus())) {
            inv.setStatus(status);
            invoiceRepo.save(inv);
        }
    }
}
