package com.payroll.backend.facilities;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaRepository repo;

    public AreaController(AreaRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Area> list(@RequestParam(required = false) Long janitorStaffId) {
        if (janitorStaffId != null) return repo.findByAssignedJanitorStaffIdOrderByNameAsc(janitorStaffId);
        return repo.findAllByOrderByNameAsc();
    }

    @PostMapping
    public Area create(@RequestBody Area body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getName() == null || body.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Area update(@PathVariable Long id, @RequestBody Area body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Area a = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getName() != null) a.setName(body.getName());
        a.setBuilding(body.getBuilding());
        a.setFloor(body.getFloor());
        a.setAssignedJanitorStaffId(body.getAssignedJanitorStaffId());
        return repo.save(a);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
