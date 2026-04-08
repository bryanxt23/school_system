package com.payroll.backend.facilities;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/cleaning-schedules")
public class CleaningScheduleController {

    private final CleaningScheduleRepository repo;

    public CleaningScheduleController(CleaningScheduleRepository repo) { this.repo = repo; }

    @GetMapping
    public List<CleaningSchedule> list(@RequestParam(required = false) Long areaId) {
        if (areaId != null) return repo.findByAreaIdOrderByIdDesc(areaId);
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public CleaningSchedule create(@RequestBody CleaningSchedule body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getAreaId() == null || body.getDayOfWeek() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "areaId and dayOfWeek required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public CleaningSchedule update(@PathVariable Long id, @RequestBody CleaningSchedule body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        CleaningSchedule c = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getAreaId() != null) c.setAreaId(body.getAreaId());
        if (body.getDayOfWeek() != null) c.setDayOfWeek(body.getDayOfWeek());
        c.setTimeSlot(body.getTimeSlot());
        if (body.getFrequency() != null) c.setFrequency(body.getFrequency());
        return repo.save(c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
