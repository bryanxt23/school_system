package com.payroll.backend.facilities;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/janitor-tasks")
public class JanitorTaskController {

    private final JanitorTaskRepository repo;

    public JanitorTaskController(JanitorTaskRepository repo) { this.repo = repo; }

    @GetMapping
    public List<JanitorTask> list(@RequestParam(required = false) Long janitorStaffId,
                                  @RequestParam(required = false) Long areaId,
                                  @RequestParam(required = false) String status) {
        if (janitorStaffId != null && status != null && !status.isBlank())
            return repo.findByJanitorStaffIdAndStatusOrderByDueDateAscIdAsc(janitorStaffId, status);
        if (janitorStaffId != null) return repo.findByJanitorStaffIdOrderByDueDateAscIdAsc(janitorStaffId);
        if (areaId != null)         return repo.findByAreaIdOrderByDueDateAscIdAsc(areaId);
        if (status != null && !status.isBlank()) return repo.findByStatusOrderByDueDateAscIdAsc(status);
        return repo.findAllByOrderByDueDateAscIdAsc();
    }

    @PostMapping
    public JanitorTask create(@RequestBody JanitorTask body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getAreaId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "areaId required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public JanitorTask update(@PathVariable Long id, @RequestBody JanitorTask body, HttpServletRequest req) {
        // Janitor or admin can update; janitor can only mark their own tasks
        AdminGuard.requireAdminOrJanitor(req);
        JanitorTask t = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if ("Janitor".equals(req.getHeader("X-User-Role"))) {
            Long me = AdminGuard.currentLinkedEntityId(req);
            if (me == null || !me.equals(t.getJanitorStaffId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your task");
            }
        }

        if (body.getAreaId() != null) t.setAreaId(body.getAreaId());
        if (body.getJanitorStaffId() != null) t.setJanitorStaffId(body.getJanitorStaffId());
        if (body.getDueDate() != null) t.setDueDate(body.getDueDate());
        if (body.getNotes() != null) t.setNotes(body.getNotes());
        if (body.getStatus() != null && !body.getStatus().isBlank()) {
            t.setStatus(body.getStatus());
            t.setCompletedAt("DONE".equals(body.getStatus()) ? LocalDateTime.now() : null);
        }
        return repo.save(t);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
