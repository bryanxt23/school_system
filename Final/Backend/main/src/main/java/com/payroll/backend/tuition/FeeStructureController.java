package com.payroll.backend.tuition;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/fee-structures")
public class FeeStructureController {

    private final FeeStructureRepository repo;

    public FeeStructureController(FeeStructureRepository repo) { this.repo = repo; }

    @GetMapping
    public List<FeeStructure> list(@RequestParam(required = false) Long schoolYearId) {
        if (schoolYearId != null) return repo.findBySchoolYearIdOrderByIdDesc(schoolYearId);
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public FeeStructure create(@RequestBody FeeStructure body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getGradeLevelId() == null || body.getSchoolYearId() == null || body.getTotalAmount() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "gradeLevelId, schoolYearId and totalAmount required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public FeeStructure update(@PathVariable Long id, @RequestBody FeeStructure body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        FeeStructure f = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getGradeLevelId() != null) f.setGradeLevelId(body.getGradeLevelId());
        if (body.getSchoolYearId() != null) f.setSchoolYearId(body.getSchoolYearId());
        if (body.getTotalAmount()  != null) f.setTotalAmount(body.getTotalAmount());
        f.setBreakdown(body.getBreakdown());
        return repo.save(f);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
