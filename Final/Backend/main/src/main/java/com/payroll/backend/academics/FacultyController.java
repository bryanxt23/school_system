package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/faculties")
public class FacultyController {

    private final FacultyRepository repo;

    public FacultyController(FacultyRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Faculty> list() { return repo.findAllByOrderByNameAsc(); }

    @PostMapping
    public Faculty create(@RequestBody Faculty body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getName() == null || body.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name required");
        if (repo.existsByName(body.getName()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Faculty already exists");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Faculty update(@PathVariable Long id, @RequestBody Faculty body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Faculty f = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getName() != null) f.setName(body.getName());
        f.setHeadStaffId(body.getHeadStaffId());
        return repo.save(f);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
