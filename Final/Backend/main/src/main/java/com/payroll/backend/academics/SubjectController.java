package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository repo;

    public SubjectController(SubjectRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Subject> list(@RequestParam(required = false) Long gradeLevelId,
                              @RequestParam(required = false) Long facultyId) {
        if (gradeLevelId != null) return repo.findByGradeLevelIdOrderByCodeAsc(gradeLevelId);
        if (facultyId != null) return repo.findByFacultyIdOrderByCodeAsc(facultyId);
        return repo.findAllByOrderByCodeAsc();
    }

    @PostMapping
    public Subject create(@RequestBody Subject body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getCode() == null || body.getCode().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "code required");
        if (body.getTitle() == null || body.getTitle().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");
        if (repo.existsByCode(body.getCode()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Subject code already exists");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Subject update(@PathVariable Long id, @RequestBody Subject body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Subject s = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getCode() != null) s.setCode(body.getCode());
        if (body.getTitle() != null) s.setTitle(body.getTitle());
        s.setUnits(body.getUnits());
        s.setGradeLevelId(body.getGradeLevelId());
        s.setFacultyId(body.getFacultyId());
        return repo.save(s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
