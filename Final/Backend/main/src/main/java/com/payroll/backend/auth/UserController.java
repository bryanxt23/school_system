package com.payroll.backend.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository     userRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserController(AppUserRepository userRepo) {
        this.userRepo = userRepo;
    }

    private boolean isAdmin(HttpServletRequest req) {
        return "Admin".equals(req.getHeader("X-User-Role"));
    }

    private void requireKnownRole(String role) {
        if (role == null || !AuthController.KNOWN_ROLES.contains(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Role must be one of " + AuthController.KNOWN_ROLES);
        }
    }

    private Map<String, Object> toMap(AppUser u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",                u.getId());
        m.put("username",          u.getUsername());
        m.put("email",             u.getEmail() != null ? u.getEmail() : "");
        m.put("role",              u.getRole());
        m.put("employeeCode",      u.getEmployeeCode() != null ? u.getEmployeeCode() : "");
        m.put("linkedEntityType",  u.getLinkedEntityType());
        m.put("linkedEntityId",    u.getLinkedEntityId());
        return m;
    }

    @GetMapping
    public List<Map<String, Object>> list(HttpServletRequest req) {
        if (!isAdmin(req)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return userRepo.findAll().stream().map(this::toMap).toList();
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        if (!isAdmin(req)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        String username = String.valueOf(body.get("username"));
        if ("admin".equalsIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username 'admin' is reserved");
        }
        if (userRepo.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        String role = String.valueOf(body.getOrDefault("role", "Admin"));
        requireKnownRole(role);

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(String.valueOf(body.getOrDefault("email", "")));
        user.setPassword(encoder.encode(String.valueOf(body.get("password"))));
        user.setRole(role);

        String ec = body.containsKey("employeeCode") ? String.valueOf(body.get("employeeCode")) : "";
        user.setEmployeeCode(ec.isBlank() ? null : ec);

        if (body.containsKey("linkedEntityType")) {
            String t = String.valueOf(body.get("linkedEntityType"));
            user.setLinkedEntityType(t.isBlank() || "null".equals(t) ? null : t);
        }
        if (body.containsKey("linkedEntityId")) {
            Object v = body.get("linkedEntityId");
            user.setLinkedEntityId(v == null || "".equals(v) ? null : Long.valueOf(v.toString()));
        }

        return toMap(userRepo.save(user));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id,
                                      @RequestBody Map<String, Object> body,
                                      HttpServletRequest req) {
        if (!isAdmin(req)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (body.containsKey("username")) user.setUsername(String.valueOf(body.get("username")));
        if (body.containsKey("email"))    user.setEmail(String.valueOf(body.get("email")));
        if (body.containsKey("role")) {
            String role = String.valueOf(body.get("role"));
            requireKnownRole(role);
            user.setRole(role);
        }
        if (body.containsKey("password")) {
            String pw = String.valueOf(body.get("password"));
            if (!pw.isBlank()) user.setPassword(encoder.encode(pw));
        }
        if (body.containsKey("employeeCode")) {
            String ec = String.valueOf(body.get("employeeCode"));
            user.setEmployeeCode(ec.isBlank() ? null : ec);
        }
        if (body.containsKey("linkedEntityType")) {
            String t = String.valueOf(body.get("linkedEntityType"));
            user.setLinkedEntityType(t.isBlank() || "null".equals(t) ? null : t);
        }
        if (body.containsKey("linkedEntityId")) {
            Object v = body.get("linkedEntityId");
            user.setLinkedEntityId(v == null || "".equals(v) ? null : Long.valueOf(v.toString()));
        }

        return toMap(userRepo.save(user));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        if (!isAdmin(req)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        userRepo.deleteById(id);
    }
}
