package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/school-years")
public class SchoolYearController {

    private final SchoolYearRepository repo;

    public SchoolYearController(SchoolYearRepository repo) { this.repo = repo; }

    @GetMapping
    public List<SchoolYear> list() {
        return repo.findAllByOrderByLabelDesc();
    }

    @PostMapping
    public SchoolYear create(@RequestBody SchoolYear body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getLabel() == null || body.getLabel().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Label is required");
        if (repo.existsByLabel(body.getLabel()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "School year already exists");
        if (body.isActive()) clearActive();
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public SchoolYear update(@PathVariable Long id, @RequestBody SchoolYear body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        SchoolYear sy = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getLabel() != null) sy.setLabel(body.getLabel());
        sy.setStartDate(body.getStartDate());
        sy.setEndDate(body.getEndDate());
        if (body.isActive() && !sy.isActive()) clearActive();
        sy.setActive(body.isActive());
        return repo.save(sy);
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
