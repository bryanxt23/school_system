package com.payroll.backend.facilities;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class AdminGuard {
    private AdminGuard() {}

    static void requireAdmin(HttpServletRequest req) {
        if (!"Admin".equals(req.getHeader("X-User-Role"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
    }

    static void requireAdminOrJanitor(HttpServletRequest req) {
        String role = req.getHeader("X-User-Role");
        if (!"Admin".equals(role) && !"Janitor".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin or Janitor only");
        }
    }

    static void requireAdminOrTeacher(HttpServletRequest req) {
        String role = req.getHeader("X-User-Role");
        if (!"Admin".equals(role) && !"Teacher".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin or Teacher only");
        }
    }

    static Long currentLinkedEntityId(HttpServletRequest req) {
        String s = req.getHeader("X-Linked-Entity-Id");
        if (s == null || s.isBlank()) return null;
        try { return Long.valueOf(s); } catch (NumberFormatException e) { return null; }
    }
}
