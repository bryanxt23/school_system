package com.payroll.backend.people;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/student-sports")
public class StudentSportController {

    private final StudentSportRepository repo;

    public StudentSportController(StudentSportRepository repo) { this.repo = repo; }

    @GetMapping
    public List<StudentSport> list(@RequestParam(required = false) Long studentId,
                                   @RequestParam(required = false) Long sportId) {
        if (studentId != null) return repo.findByStudentIdOrderByIdDesc(studentId);
        if (sportId != null)   return repo.findBySportIdOrderByIdDesc(sportId);
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public StudentSport create(@RequestBody StudentSport body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getStudentId() == null || body.getSportId() == null || body.getSchoolYearId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "studentId, sportId and schoolYearId required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public StudentSport update(@PathVariable Long id, @RequestBody StudentSport body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        StudentSport ss = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getStudentId() != null) ss.setStudentId(body.getStudentId());
        if (body.getSportId() != null) ss.setSportId(body.getSportId());
        if (body.getSchoolYearId() != null) ss.setSchoolYearId(body.getSchoolYearId());
        ss.setJerseyNumber(body.getJerseyNumber());
        ss.setPosition(body.getPosition());
        return repo.save(ss);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
