package com.payroll.backend.people;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/parent-student")
public class ParentStudentController {

    private final ParentStudentRepository repo;

    public ParentStudentController(ParentStudentRepository repo) { this.repo = repo; }

    @GetMapping
    public List<ParentStudent> list(@RequestParam(required = false) Long parentId,
                                    @RequestParam(required = false) Long studentId) {
        if (parentId != null) return repo.findByParentId(parentId);
        if (studentId != null) return repo.findByStudentId(studentId);
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public ParentStudent create(@RequestBody ParentStudent body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getParentId() == null || body.getStudentId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "parentId and studentId required");
        if (body.getRelationship() == null || body.getRelationship().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "relationship required");
        if (repo.existsByParentIdAndStudentId(body.getParentId(), body.getStudentId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Link already exists");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public ParentStudent update(@PathVariable Long id, @RequestBody ParentStudent body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        ParentStudent link = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getRelationship() != null) link.setRelationship(body.getRelationship());
        link.setPrimary(body.isPrimary());
        return repo.save(link);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
