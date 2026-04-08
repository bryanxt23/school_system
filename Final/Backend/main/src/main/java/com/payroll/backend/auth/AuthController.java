package com.payroll.backend.auth;

import com.payroll.backend.employee.Employee;
import com.payroll.backend.employee.EmployeeRepository;
import com.payroll.backend.people.Parent;
import com.payroll.backend.people.ParentRepository;
import com.payroll.backend.people.Student;
import com.payroll.backend.people.StudentRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** All roles known to Phase 3. Anything else is rejected. */
    static final java.util.Set<String> KNOWN_ROLES = java.util.Set.of(
            "Admin", "Teacher", "Student", "Parent", "Janitor", "SecurityGuard"
    );

    private final AppUserRepository    userRepo;
    private final EmployeeRepository   employeeRepo;
    private final StudentRepository    studentRepo;
    private final ParentRepository     parentRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(AppUserRepository userRepo,
                          EmployeeRepository employeeRepo,
                          StudentRepository studentRepo,
                          ParentRepository parentRepo) {
        this.userRepo     = userRepo;
        this.employeeRepo = employeeRepo;
        this.studentRepo  = studentRepo;
        this.parentRepo   = parentRepo;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return buildSession(user);
    }

    /** Returns the current user's profile + linked entity. Used by the SPA on bootstrap. */
    @GetMapping("/me")
    public Map<String, Object> me(@RequestHeader(value = "X-Username", required = false) String username) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("Not authenticated");
        }
        AppUser user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildSession(user);
    }

    /** Common response builder shared by /login and /me. */
    private Map<String, Object> buildSession(AppUser user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id",               user.getId());
        response.put("username",         user.getUsername());
        response.put("email",            user.getEmail() != null ? user.getEmail() : "");
        response.put("role",             user.getRole());
        response.put("employeeCode",     user.getEmployeeCode() != null ? user.getEmployeeCode() : "");
        response.put("linkedEntityType", user.getLinkedEntityType());
        response.put("linkedEntityId",   user.getLinkedEntityId());
        response.put("permissions",      permissionsFor(user.getRole()));

        // Resolve the linked domain entity for client-side display
        Map<String, Object> link = resolveLink(user);
        if (link != null) response.put("linkedEntity", link);

        // Legacy fields kept for old UI shell
        if (user.getEmployeeCode() != null && !user.getEmployeeCode().isBlank()) {
            employeeRepo.findByCode(user.getEmployeeCode()).ifPresent(emp -> {
                response.put("photoUrl",     emp.getPhotoUrl() != null ? emp.getPhotoUrl() : "");
                response.put("employeeName", emp.getName() != null ? emp.getName() : "");
            });
        }
        return response;
    }

    /** Capability flags driven by role. Phase 4+ may extend these. */
    private Map<String, Object> permissionsFor(String role) {
        Map<String, Object> p = new HashMap<>();
        boolean isAdmin = "Admin".equals(role);
        p.put("isAdmin",         isAdmin);
        p.put("canManageUsers",  isAdmin);
        p.put("canManageAcademics", isAdmin);
        p.put("canManageDirectory", isAdmin);
        p.put("canEncodeGrades", "Teacher".equals(role) || isAdmin);
        p.put("canViewGrades",   true);
        p.put("canManageTasks",  "Janitor".equals(role)       || isAdmin);
        p.put("canLogVisitors",  "SecurityGuard".equals(role) || isAdmin);
        return p;
    }

    /** Returns a small {type, id, displayName, ...} map for the UI. */
    private Map<String, Object> resolveLink(AppUser user) {
        String type = user.getLinkedEntityType();
        Long   id   = user.getLinkedEntityId();
        if (type == null || id == null) return null;

        Map<String, Object> link = new HashMap<>();
        link.put("type", type);
        link.put("id",   id);

        switch (type) {
            case "STAFF" -> employeeRepo.findById(id).ifPresent(e -> populateStaff(link, e));
            case "STUDENT" -> studentRepo.findById(id).ifPresent(s -> populateStudent(link, s));
            case "PARENT"  -> parentRepo.findById(id).ifPresent(p -> populateParent(link, p));
            default -> {}
        }
        return link;
    }

    private void populateStaff(Map<String, Object> link, Employee e) {
        link.put("displayName", e.getName());
        link.put("staffType",   e.getStaffType());
        link.put("photoUrl",    e.getPhotoUrl());
        link.put("code",        e.getCode());
    }

    private void populateStudent(Map<String, Object> link, Student s) {
        link.put("displayName",      s.getFirstName() + " " + s.getLastName());
        link.put("studentNumber",    s.getStudentNumber());
        link.put("currentSectionId", s.getCurrentSectionId());
        link.put("photoUrl",         s.getPhotoUrl());
        link.put("status",           s.getStatus());
    }

    private void populateParent(Map<String, Object> link, Parent p) {
        link.put("displayName", p.getFirstName() + " " + p.getLastName());
        link.put("contact",     p.getContact());
        link.put("email",       p.getEmail());
    }
}
