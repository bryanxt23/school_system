package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterRepository repo;

    public SemesterController(SemesterRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Semester> list(@RequestParam(required = false) Long schoolYearId) {
        if (schoolYearId != null) return repo.findBySchoolYearIdOrderByLabelAsc(schoolYearId);
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public Semester create(@RequestBody Semester body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getSchoolYearId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "schoolYearId required");
        if (body.getLabel() == null || body.getLabel().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "label required");
        if (body.isActive()) clearActive();
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Semester update(@PathVariable Long id, @RequestBody Semester body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Semester s = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getSchoolYearId() != null) s.setSchoolYearId(body.getSchoolYearId());
        if (body.getLabel() != null) s.setLabel(body.getLabel());
        s.setStartDate(body.getStartDate());
        s.setEndDate(body.getEndDate());
        if (body.isActive() && !s.isActive()) clearActive();
        s.setActive(body.isActive());
        return repo.save(s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }

    private void clearActive() {
        repo.findAll().forEach(s -> {
            if (s.isActive()) { s.setActive(false); repo.save(s); }
        });
    }
}
