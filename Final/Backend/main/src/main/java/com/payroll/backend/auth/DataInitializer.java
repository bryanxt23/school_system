package com.payroll.backend.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DataInitializer(AppUserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public void run(String... args) {
        // Phase 0 dev convenience: always ensure an 'admin' user exists with
        // role=Admin and password='root'. Replace with a real bootstrap flow
        // before this app sees production data.
        AppUser admin = userRepo.findByUsername("admin").orElseGet(() -> {
            AppUser fresh = new AppUser();
            fresh.setUsername("admin");
            return fresh;
        });
        admin.setEmail("admin@pathwise.local");
        admin.setPassword(encoder.encode("root"));
        admin.setRole("Admin");
        userRepo.save(admin);
        System.out.println("✅ Admin user ensured: admin / root");
    }
}
