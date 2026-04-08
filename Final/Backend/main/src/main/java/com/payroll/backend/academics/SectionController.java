package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    private final SectionRepository repo;

    public SectionController(SectionRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Section> list(@RequestParam(required = false) Long schoolYearId,
                              @RequestParam(required = false) Long gradeLevelId) {
        if (schoolYearId != null) return repo.findBySchoolYearIdOrderByNameAsc(schoolYearId);
        if (gradeLevelId != null) return repo.findByGradeLevelIdOrderByNameAsc(gradeLevelId);
        return repo.findAllByOrderByNameAsc();
    }

    @PostMapping
    public Section create(@RequestBody Section body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getName() == null || body.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name required");
        if (body.getGradeLevelId() == null || body.getSchoolYearId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "gradeLevelId and schoolYearId required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Section update(@PathVariable Long id, @RequestBody Section body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Section s = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getName() != null) s.setName(body.getName());
        if (body.getGradeLevelId() != null) s.setGradeLevelId(body.getGradeLevelId());
        if (body.getSchoolYearId() != null) s.setSchoolYearId(body.getSchoolYearId());
        s.setAdviserStaffId(body.getAdviserStaffId());
        return repo.save(s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
