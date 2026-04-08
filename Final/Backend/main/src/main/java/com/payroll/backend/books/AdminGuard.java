package com.payroll.backend.books;

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
}
