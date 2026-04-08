package com.payroll.backend.academics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Shared admin-role check used by every academics controller. */
final class AdminGuard {
    private AdminGuard() {}

    static void requireAdmin(HttpServletRequest req) {
        if (!"Admin".equals(req.getHeader("X-User-Role"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
    }
}
