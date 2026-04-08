package com.payroll.backend.people;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository repo;

    public StudentController(StudentRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Student> list(@RequestParam(required = false) Long sectionId,
                              @RequestParam(required = false) String status) {
        if (sectionId != null) return repo.findByCurrentSectionIdOrderByLastNameAsc(sectionId);
        if (status != null && !status.isBlank())
            return repo.findByStatusOrderByLastNameAsc(status);
        return repo.findAllByOrderByLastNameAscFirstNameAsc();
    }

    @GetMapping("/{id}")
    public Student get(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public Student create(@RequestBody Student body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getStudentNumber() == null || body.getStudentNumber().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentNumber required");
        if (body.getFirstName() == null || body.getFirstName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "firstName required");
        if (body.getLastName() == null || body.getLastName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "lastName required");
        if (repo.existsByStudentNumber(body.getStudentNumber()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student number already exists");
        if (body.getStatus() == null || body.getStatus().isBlank()) body.setStatus("ENROLLED");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @RequestBody Student body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Student s = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getStudentNumber() != null) s.setStudentNumber(body.getStudentNumber());
        if (body.getFirstName() != null) s.setFirstName(body.getFirstName());
        s.setMiddleName(body.getMiddleName());
        if (body.getLastName() != null) s.setLastName(body.getLastName());
        s.setBirthdate(body.getBirthdate());
        s.setSex(body.getSex());
        s.setAddress(body.getAddress());
        s.setContact(body.getContact());
        s.setPhotoUrl(body.getPhotoUrl());
        s.setCurrentSectionId(body.getCurrentSectionId());
        if (body.getStatus() != null && !body.getStatus().isBlank()) s.setStatus(body.getStatus());
        return repo.save(s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
