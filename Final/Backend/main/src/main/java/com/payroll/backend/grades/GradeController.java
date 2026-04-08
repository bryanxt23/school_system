package com.payroll.backend.grades;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/grades")
public class GradeController {

    private static final Set<String> VALID_PERIODS = Set.of("MIDTERM", "FINAL");

    private final GradeRepository repo;

    public GradeController(GradeRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Grade> list(@RequestParam(required = false) Long classOfferingId,
                            @RequestParam(required = false) Long studentId) {
        if (classOfferingId != null && studentId != null)
            return repo.findByStudentIdAndClassOfferingId(studentId, classOfferingId);
        if (classOfferingId != null) return repo.findByClassOfferingId(classOfferingId);
        if (studentId != null)       return repo.findByStudentIdOrderByEncodedAtDesc(studentId);
        return repo.findAll();
    }

    /**
     * Bulk upsert. Body shape:
     * {
     *   "classOfferingId": 12,
     *   "entries": [
     *     { "studentId": 5, "period": "MIDTERM", "score": 92.5, "remarks": "..." },
     *     ...
     *   ]
     * }
     * Teachers/Admins only. Empty/null score blanks an existing grade.
     */
    @PutMapping("/bulk")
    public Map<String, Object> bulkUpsert(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        requireTeacherOrAdmin(req);

        Object cidObj = body.get("classOfferingId");
        if (cidObj == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classOfferingId required");
        Long classOfferingId = Long.valueOf(cidObj.toString());

        Long encodedBy = parseLong(req.getHeader("X-Linked-Entity-Id"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> entries = (List<Map<String, Object>>) body.get("entries");
        if (entries == null) entries = List.of();

        int saved = 0, deleted = 0;
        for (Map<String, Object> entry : entries) {
            Long studentId = parseLong(entry.get("studentId"));
            String period  = String.valueOf(entry.get("period"));
            if (studentId == null || !VALID_PERIODS.contains(period)) continue;

            Object scoreObj = entry.get("score");
            String  remarks = entry.get("remarks") == null ? null : String.valueOf(entry.get("remarks"));

            Optional<Grade> existing =
                repo.findByStudentIdAndClassOfferingIdAndPeriod(studentId, classOfferingId, period);

            // Blank score with no remarks → delete the row
            if ((scoreObj == null || "".equals(scoreObj)) && (remarks == null || remarks.isBlank())) {
                if (existing.isPresent()) { repo.delete(existing.get()); deleted++; }
                continue;
            }

            Grade g = existing.orElseGet(Grade::new);
            g.setStudentId(studentId);
            g.setClassOfferingId(classOfferingId);
            g.setPeriod(period);
            g.setScore(scoreObj == null || "".equals(scoreObj) ? null : new BigDecimal(scoreObj.toString()));
            g.setRemarks(remarks == null || remarks.isBlank() ? null : remarks);
            if (encodedBy != null) g.setEncodedByStaffId(encodedBy);
            repo.save(g);
            saved++;
        }
        return Map.of("saved", saved, "deleted", deleted);
    }

    private void requireTeacherOrAdmin(HttpServletRequest req) {
        String role = req.getHeader("X-User-Role");
        if (!"Admin".equals(role) && !"Teacher".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Teacher or Admin only");
        }
    }

    private Long parseLong(Object o) {
        if (o == null || "".equals(o)) return null;
        try { return Long.valueOf(o.toString()); } catch (NumberFormatException ex) { return null; }
    }
}
