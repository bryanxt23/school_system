package com.payroll.backend.people;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentRepository repo;
    private final StudentRepository studentRepo;

    public EnrollmentController(EnrollmentRepository repo, StudentRepository studentRepo) {
        this.repo = repo;
        this.studentRepo = studentRepo;
    }

    @GetMapping
    public List<Enrollment> list(@RequestParam(required = false) Long studentId,
                                 @RequestParam(required = false) Long sectionId,
                                 @RequestParam(required = false) Long schoolYearId,
                                 @RequestParam(required = false) Long semesterId) {
        if (studentId != null) return repo.findByStudentIdOrderByEnrolledAtDesc(studentId);
        if (sectionId != null) return repo.findBySectionIdOrderByEnrolledAtDesc(sectionId);
        if (schoolYearId != null && semesterId != null)
            return repo.findBySchoolYearIdAndSemesterIdOrderByEnrolledAtDesc(schoolYearId, semesterId);
        return repo.findAllByOrderByEnrolledAtDesc();
    }

    @PostMapping
    public Enrollment create(@RequestBody Enrollment body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getStudentId() == null || body.getSchoolYearId() == null
            || body.getSemesterId() == null || body.getSectionId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "studentId, schoolYearId, semesterId and sectionId required");
        Enrollment saved = repo.save(body);
        // Denormalize: keep Student.currentSectionId in sync with the latest enrollment
        studentRepo.findById(body.getStudentId()).ifPresent(stu -> {
            stu.setCurrentSectionId(body.getSectionId());
            studentRepo.save(stu);
        });
        return saved;
    }

    @PutMapping("/{id}")
    public Enrollment update(@PathVariable Long id, @RequestBody Enrollment body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Enrollment e = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getSectionId() != null) e.setSectionId(body.getSectionId());
        if (body.getSemesterId() != null) e.setSemesterId(body.getSemesterId());
        if (body.getSchoolYearId() != null) e.setSchoolYearId(body.getSchoolYearId());
        if (body.getStatus() != null) e.setStatus(body.getStatus());
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
