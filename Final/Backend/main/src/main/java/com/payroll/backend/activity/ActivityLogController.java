package com.payroll.backend.activity;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityLogController {

    private final ActivityLogRepository repo;

    public ActivityLogController(ActivityLogRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<ActivityLog> recent() {
        return repo.findTop20ByOrderByCreatedAtDesc();
    }

    @GetMapping("/report")
    public List<ActivityLog> report(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty())
            return repo.findByCategoryOrderByCreatedAtDesc(category);
        return repo.findAllByOrderByCreatedAtDesc();
    }
}
