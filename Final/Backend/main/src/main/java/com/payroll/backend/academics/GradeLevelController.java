package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/grade-levels")
public class GradeLevelController {

    private final GradeLevelRepository repo;

    public GradeLevelController(GradeLevelRepository repo) { this.repo = repo; }

    @GetMapping
    public List<GradeLevel> list(@RequestParam(required = false) Long facultyId) {
        if (facultyId != null) return repo.findByFacultyIdOrderByOrderingAscNameAsc(facultyId);
        return repo.findAllByOrderByOrderingAscNameAsc();
    }

    @PostMapping
    public GradeLevel create(@RequestBody GradeLevel body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getName() == null || body.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public GradeLevel update(@PathVariable Long id, @RequestBody GradeLevel body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        GradeLevel g = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getName() != null) g.setName(body.getName());
        g.setFacultyId(body.getFacultyId());
        g.setOrdering(body.getOrdering());
        return repo.save(g);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
