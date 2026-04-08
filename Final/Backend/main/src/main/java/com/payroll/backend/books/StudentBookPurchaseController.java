package com.payroll.backend.books;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/student-book-purchases")
public class StudentBookPurchaseController {

    private final StudentBookPurchaseRepository repo;

    public StudentBookPurchaseController(StudentBookPurchaseRepository repo) { this.repo = repo; }

    @GetMapping
    public List<StudentBookPurchase> list(@RequestParam(required = false) Long studentId) {
        if (studentId != null) return repo.findByStudentIdOrderByPurchasedAtDesc(studentId);
        return repo.findAllByOrderByPurchasedAtDesc();
    }

    @PostMapping
    public StudentBookPurchase create(@RequestBody StudentBookPurchase body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getStudentId() == null || body.getBookId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId and bookId required");

        String linkedId = req.getHeader("X-Linked-Entity-Id");
        if (linkedId != null && !linkedId.isBlank()) {
            try { body.setReceivedByStaffId(Long.valueOf(linkedId)); } catch (NumberFormatException ignored) {}
        }
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public StudentBookPurchase update(@PathVariable Long id, @RequestBody StudentBookPurchase body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        StudentBookPurchase p = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getAmount() != null) p.setAmount(body.getAmount());
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
