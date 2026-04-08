package com.payroll.backend.tuition;

import com.payroll.backend.academics.SectionRepository;
import com.payroll.backend.people.Student;
import com.payroll.backend.people.StudentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/tuition-invoices")
public class TuitionInvoiceController {

    private final TuitionInvoiceRepository repo;
    private final FeeStructureRepository feeRepo;
    private final StudentRepository studentRepo;
    private final SectionRepository sectionRepo;

    public TuitionInvoiceController(TuitionInvoiceRepository repo,
                                    FeeStructureRepository feeRepo,
                                    StudentRepository studentRepo,
                                    SectionRepository sectionRepo) {
        this.repo = repo;
        this.feeRepo = feeRepo;
        this.studentRepo = studentRepo;
        this.sectionRepo = sectionRepo;
    }

    @GetMapping
    public List<TuitionInvoice> list(@RequestParam(required = false) Long studentId,
                                     @RequestParam(required = false) Long semesterId) {
        if (studentId != null) return repo.findByStudentIdOrderByIdDesc(studentId);
        if (semesterId != null) return repo.findBySemesterIdOrderByIdDesc(semesterId);
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public TuitionInvoice create(@RequestBody TuitionInvoice body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getStudentId() == null || body.getSchoolYearId() == null
                || body.getSemesterId() == null || body.getAmount() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "studentId, schoolYearId, semesterId and amount required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public TuitionInvoice update(@PathVariable Long id, @RequestBody TuitionInvoice body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        TuitionInvoice inv = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getAmount() != null) inv.setAmount(body.getAmount());
        inv.setDueDate(body.getDueDate());
        if (body.getStatus() != null && !body.getStatus().isBlank()) inv.setStatus(body.getStatus());
        return repo.save(inv);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }

    /**
     * Bulk generate invoices for every enrolled student at a grade level for a given semester.
     * Body: { feeStructureId, semesterId, dueDate? }
     * Skips students that already have an invoice for that (student, schoolYear, semester) tuple.
     */
    @PostMapping("/generate")
    public Map<String, Object> generate(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Long feeStructureId = parseLong(body.get("feeStructureId"));
        Long semesterId     = parseLong(body.get("semesterId"));
        if (feeStructureId == null || semesterId == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "feeStructureId and semesterId required");

        FeeStructure fs = feeRepo.findById(feeStructureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Fee structure not found"));

        LocalDate dueDate = null;
        Object due = body.get("dueDate");
        if (due != null && !"".equals(due)) {
            try { dueDate = LocalDate.parse(due.toString()); } catch (Exception ignored) {}
        }

        // All sections that belong to this fee structure's grade level
        Set<Long> targetSectionIds = new HashSet<>();
        sectionRepo.findAll().forEach(sec -> {
            if (Objects.equals(sec.getGradeLevelId(), fs.getGradeLevelId())) {
                targetSectionIds.add(sec.getId());
            }
        });

        int created = 0, skipped = 0;
        List<Student> all = studentRepo.findAll();
        for (Student st : all) {
            if (st.getCurrentSectionId() == null || !targetSectionIds.contains(st.getCurrentSectionId())) continue;
            if (!"ENROLLED".equals(st.getStatus())) continue;

            Optional<TuitionInvoice> existing = repo.findByStudentIdAndSchoolYearIdAndSemesterId(
                    st.getId(), fs.getSchoolYearId(), semesterId);
            if (existing.isPresent()) { skipped++; continue; }

            TuitionInvoice inv = new TuitionInvoice();
            inv.setStudentId(st.getId());
            inv.setSchoolYearId(fs.getSchoolYearId());
            inv.setSemesterId(semesterId);
            inv.setAmount(fs.getTotalAmount());
            inv.setDueDate(dueDate);
            inv.setStatus("UNPAID");
            repo.save(inv);
            created++;
        }
        return Map.of("created", created, "skipped", skipped, "feeStructureId", feeStructureId);
    }

    private Long parseLong(Object o) {
        if (o == null || "".equals(o)) return null;
        try { return Long.valueOf(o.toString()); } catch (NumberFormatException ex) { return null; }
    }
}
