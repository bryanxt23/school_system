package com.payroll.backend.announcements;

import com.payroll.backend.academics.Section;
import com.payroll.backend.academics.SectionRepository;
import com.payroll.backend.auth.AppUser;
import com.payroll.backend.auth.AppUserRepository;
import com.payroll.backend.people.ParentStudentRepository;
import com.payroll.backend.people.Student;
import com.payroll.backend.people.StudentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementRepository repo;
    private final AppUserRepository userRepo;
    private final StudentRepository studentRepo;
    private final SectionRepository sectionRepo;
    private final ParentStudentRepository parentStudentRepo;

    public AnnouncementController(AnnouncementRepository repo,
                                  AppUserRepository userRepo,
                                  StudentRepository studentRepo,
                                  SectionRepository sectionRepo,
                                  ParentStudentRepository parentStudentRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.studentRepo = studentRepo;
        this.sectionRepo = sectionRepo;
        this.parentStudentRepo = parentStudentRepo;
    }

    /**
     * @param audience optional. "auto" filters server-side to what the current user can see.
     *                 Anything else (or omitted) returns the full list (admin view).
     */
    @GetMapping
    public List<Announcement> list(@RequestParam(required = false) String audience,
                                   HttpServletRequest req) {
        List<Announcement> all = repo.findAllByOrderByPostedAtDesc();

        // Drop expired
        LocalDateTime now = LocalDateTime.now();
        all.removeIf(a -> a.getExpiresAt() != null && a.getExpiresAt().isBefore(now));

        if (!"auto".equals(audience)) {
            // Admin view: return all (admin guard not required for read; UI gates the page)
            return all;
        }

        // Auto-filter to the current user
        UserContext ctx = resolveContext(req);
        return all.stream().filter(a -> matches(a.getAudience(), ctx)).toList();
    }

    @PostMapping
    public Announcement create(@RequestBody Announcement body, HttpServletRequest req) {
        requireAdminOrTeacher(req);
        if (body.getTitle() == null || body.getTitle().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");
        if (body.getBody() == null || body.getBody().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "body required");
        stampAuthor(body, req);
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Announcement update(@PathVariable Long id, @RequestBody Announcement body, HttpServletRequest req) {
        requireAdminOrTeacher(req);
        Announcement a = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        // Author or admin only
        String role = req.getHeader("X-User-Role");
        Long userId = parseLong(req.getHeader("X-User-Id"));
        if (!"Admin".equals(role) && a.getPostedByUserId() != null && !a.getPostedByUserId().equals(userId)) {
            // Allow if username matches (X-User-Id may be missing)
            String username = req.getHeader("X-Username");
            if (a.getPostedByUsername() == null || !a.getPostedByUsername().equals(username)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your post");
            }
        }
        if (body.getTitle() != null) a.setTitle(body.getTitle());
        if (body.getBody() != null) a.setBody(body.getBody());
        if (body.getAudience() != null) a.setAudience(body.getAudience());
        a.setExpiresAt(body.getExpiresAt());
        return repo.save(a);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        requireAdminOrTeacher(req);
        Announcement a = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String role = req.getHeader("X-User-Role");
        String username = req.getHeader("X-Username");
        if (!"Admin".equals(role)
                && a.getPostedByUsername() != null
                && !a.getPostedByUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your post");
        }
        repo.deleteById(id);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void requireAdminOrTeacher(HttpServletRequest req) {
        String role = req.getHeader("X-User-Role");
        if (!"Admin".equals(role) && !"Teacher".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin or Teacher only");
        }
    }

    private void stampAuthor(Announcement a, HttpServletRequest req) {
        String username = req.getHeader("X-Username");
        if (username != null && !username.isBlank()) {
            a.setPostedByUsername(username);
            userRepo.findByUsername(username).map(AppUser::getId).ifPresent(a::setPostedByUserId);
        }
    }

    private Long parseLong(String s) {
        if (s == null || s.isBlank()) return null;
        try { return Long.valueOf(s); } catch (NumberFormatException e) { return null; }
    }

    /** Snapshot of the current user's role + section/grade context for audience matching. */
    private static class UserContext {
        String role;                       // Admin / Teacher / Student / Parent / Janitor / SecurityGuard / null
        Set<Long> sectionIds = new HashSet<>();
        Set<Long> gradeLevelIds = new HashSet<>();
        boolean isStaffRole;               // Teacher / Janitor / SecurityGuard
    }

    private UserContext resolveContext(HttpServletRequest req) {
        UserContext ctx = new UserContext();
        ctx.role = req.getHeader("X-User-Role");
        ctx.isStaffRole = "Teacher".equals(ctx.role) || "Janitor".equals(ctx.role)
                       || "SecurityGuard".equals(ctx.role);

        String linkType = req.getHeader("X-Linked-Entity-Type");
        Long linkId = parseLong(req.getHeader("X-Linked-Entity-Id"));
        if (linkType == null || linkId == null) return ctx;

        if ("STUDENT".equals(linkType)) {
            studentRepo.findById(linkId).ifPresent(st -> addStudentContext(ctx, st));
        } else if ("PARENT".equals(linkType)) {
            parentStudentRepo.findByParentId(linkId).forEach(link ->
                studentRepo.findById(link.getStudentId()).ifPresent(st -> addStudentContext(ctx, st))
            );
        }
        return ctx;
    }

    private void addStudentContext(UserContext ctx, Student st) {
        if (st.getCurrentSectionId() == null) return;
        ctx.sectionIds.add(st.getCurrentSectionId());
        sectionRepo.findById(st.getCurrentSectionId())
                .map(Section::getGradeLevelId)
                .ifPresent(ctx.gradeLevelIds::add);
    }

    /** Returns true if `audience` should be visible to a user with `ctx`. */
    private boolean matches(String audience, UserContext ctx) {
        if ("Admin".equals(ctx.role)) return true;   // admins always see everything
        if (audience == null || audience.isBlank() || "ALL".equals(audience)) return true;
        if ("STUDENTS".equals(audience)) return "Student".equals(ctx.role);
        if ("PARENTS".equals(audience))  return "Parent".equals(ctx.role);
        if ("STAFF".equals(audience))    return ctx.isStaffRole || "Admin".equals(ctx.role);

        if (audience.startsWith("ROLE:")) {
            return audience.substring(5).equals(ctx.role);
        }
        if (audience.startsWith("SECTION:")) {
            Long id = parseLongStatic(audience.substring(8));
            return id != null && ctx.sectionIds.contains(id);
        }
        if (audience.startsWith("GRADELEVEL:")) {
            Long id = parseLongStatic(audience.substring(11));
            return id != null && ctx.gradeLevelIds.contains(id);
        }
        // Unknown rule: hide by default
        return false;
    }

    private static Long parseLongStatic(String s) {
        try { return Long.valueOf(s.trim()); } catch (Exception e) { return null; }
    }
}
