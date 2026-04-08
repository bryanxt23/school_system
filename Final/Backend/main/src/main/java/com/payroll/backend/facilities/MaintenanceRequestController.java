package com.payroll.backend.facilities;

import com.payroll.backend.auth.AppUser;
import com.payroll.backend.auth.AppUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance-requests")
public class MaintenanceRequestController {

    private final MaintenanceRequestRepository repo;
    private final AppUserRepository userRepo;

    public MaintenanceRequestController(MaintenanceRequestRepository repo, AppUserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    @GetMapping
    public List<MaintenanceRequest> list(@RequestParam(required = false) Long janitorStaffId,
                                         @RequestParam(required = false) String status) {
        if (janitorStaffId != null) return repo.findByAssignedJanitorStaffIdOrderByCreatedAtDesc(janitorStaffId);
        if (status != null && !status.isBlank()) return repo.findByStatusOrderByCreatedAtDesc(status);
        return repo.findAllByOrderByCreatedAtDesc();
    }

    /** Admin and Teacher can file maintenance requests. */
    @PostMapping
    public MaintenanceRequest create(@RequestBody MaintenanceRequest body, HttpServletRequest req) {
        AdminGuard.requireAdminOrTeacher(req);
        if (body.getAreaId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "areaId required");
        if (body.getDescription() == null || body.getDescription().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "description required");

        String username = req.getHeader("X-Username");
        if (username != null && !username.isBlank()) {
            body.setRequestedByUsername(username);
            userRepo.findByUsername(username).map(AppUser::getId).ifPresent(body::setRequestedByUserId);
        }
        return repo.save(body);
    }

    /** Janitor (own) or Admin can update status / assignment. */
    @PutMapping("/{id}")
    public MaintenanceRequest update(@PathVariable Long id, @RequestBody MaintenanceRequest body, HttpServletRequest req) {
        String role = req.getHeader("X-User-Role");
        if (!"Admin".equals(role) && !"Janitor".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin or Janitor only");
        }
        MaintenanceRequest m = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if ("Janitor".equals(role)) {
            Long me = AdminGuard.currentLinkedEntityId(req);
            // Janitor can only update requests assigned to them
            if (me == null || !me.equals(m.getAssignedJanitorStaffId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your request");
            }
        }

        if (body.getDescription() != null && !body.getDescription().isBlank()) m.setDescription(body.getDescription());
        if (body.getAreaId() != null) m.setAreaId(body.getAreaId());
        if (body.getAssignedJanitorStaffId() != null) m.setAssignedJanitorStaffId(body.getAssignedJanitorStaffId());
        if (body.getStatus() != null && !body.getStatus().isBlank()) {
            m.setStatus(body.getStatus());
            m.setResolvedAt("RESOLVED".equals(body.getStatus()) ? LocalDateTime.now() : null);
        }
        return repo.save(m);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
