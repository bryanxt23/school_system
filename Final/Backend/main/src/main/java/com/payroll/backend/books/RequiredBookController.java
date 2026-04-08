package com.payroll.backend.books;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/required-books")
public class RequiredBookController {

    private final RequiredBookRepository repo;

    public RequiredBookController(RequiredBookRepository repo) { this.repo = repo; }

    @GetMapping
    public List<RequiredBook> list(@RequestParam(required = false) Long subjectId,
                                   @RequestParam(required = false) Long schoolYearId,
                                   @RequestParam(required = false) String subjectIds) {
        if (subjectIds != null && !subjectIds.isBlank() && schoolYearId != null) {
            List<Long> ids = Stream.of(subjectIds.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty())
                    .map(Long::valueOf).toList();
            return repo.findBySubjectIdInAndSchoolYearId(ids, schoolYearId);
        }
        if (subjectId != null)    return repo.findBySubjectIdOrderByIdDesc(subjectId);
        if (schoolYearId != null) return repo.findBySchoolYearIdOrderByIdDesc(schoolYearId);
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public RequiredBook create(@RequestBody RequiredBook body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getSubjectId() == null || body.getBookId() == null || body.getSchoolYearId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "subjectId, bookId and schoolYearId required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public RequiredBook update(@PathVariable Long id, @RequestBody RequiredBook body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        RequiredBook r = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getSubjectId() != null) r.setSubjectId(body.getSubjectId());
        if (body.getBookId() != null) r.setBookId(body.getBookId());
        if (body.getSchoolYearId() != null) r.setSchoolYearId(body.getSchoolYearId());
        r.setMandatory(body.isMandatory());
        return repo.save(r);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
