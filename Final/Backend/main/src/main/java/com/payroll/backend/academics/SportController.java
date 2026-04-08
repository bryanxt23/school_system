package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
public class SportController {

    private final SportRepository repo;

    public SportController(SportRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Sport> list() { return repo.findAllByOrderByNameAsc(); }

    @PostMapping
    public Sport create(@RequestBody Sport body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getName() == null || body.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name required");
        if (repo.existsByName(body.getName()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sport already exists");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Sport update(@PathVariable Long id, @RequestBody Sport body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Sport s = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getName() != null) s.setName(body.getName());
        s.setCoachStaffId(body.getCoachStaffId());
        s.setSeason(body.getSeason());
        return repo.save(s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
