package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/class-offerings")
public class ClassOfferingController {

    private final ClassOfferingRepository repo;

    public ClassOfferingController(ClassOfferingRepository repo) { this.repo = repo; }

    @GetMapping
    public List<ClassOffering> list(@RequestParam(required = false) Long semesterId,
                                    @RequestParam(required = false) Long sectionId,
                                    @RequestParam(required = false) Long teacherStaffId) {
        if (semesterId != null && sectionId != null)
            return repo.findBySemesterIdAndSectionIdOrderByIdDesc(semesterId, sectionId);
        if (semesterId != null && teacherStaffId != null)
            return repo.findBySemesterIdAndTeacherStaffIdOrderByIdDesc(semesterId, teacherStaffId);
        if (semesterId != null)     return repo.findBySemesterIdOrderByIdDesc(semesterId);
        if (sectionId != null)      return repo.findBySectionIdOrderByIdDesc(sectionId);
        if (teacherStaffId != null) return repo.findByTeacherStaffIdOrderByIdDesc(teacherStaffId);
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public ClassOffering create(@RequestBody ClassOffering body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getSemesterId() == null || body.getSectionId() == null || body.getSubjectId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "semesterId, sectionId and subjectId required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public ClassOffering update(@PathVariable Long id, @RequestBody ClassOffering body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        ClassOffering c = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getSemesterId() != null) c.setSemesterId(body.getSemesterId());
        if (body.getSectionId()  != null) c.setSectionId(body.getSectionId());
        if (body.getSubjectId()  != null) c.setSubjectId(body.getSubjectId());
        c.setTeacherStaffId(body.getTeacherStaffId());
        c.setSchedule(body.getSchedule());
        c.setRoom(body.getRoom());
        return repo.save(c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
