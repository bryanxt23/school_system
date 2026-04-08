package com.payroll.backend.people;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/parents")
public class ParentController {

    private final ParentRepository repo;

    public ParentController(ParentRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Parent> list() {
        return repo.findAllByOrderByLastNameAscFirstNameAsc();
    }

    @GetMapping("/{id}")
    public Parent get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public Parent create(@RequestBody Parent body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getFirstName() == null || body.getFirstName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "firstName required");
        if (body.getLastName() == null || body.getLastName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "lastName required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Parent update(@PathVariable Long id, @RequestBody Parent body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Parent p = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getFirstName() != null) p.setFirstName(body.getFirstName());
        if (body.getLastName() != null) p.setLastName(body.getLastName());
        p.setContact(body.getContact());
        p.setEmail(body.getEmail());
        p.setOccupation(body.getOccupation());
        p.setAddress(body.getAddress());
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
