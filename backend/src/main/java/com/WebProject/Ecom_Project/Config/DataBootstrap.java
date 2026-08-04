package com.WebProject.Ecom_Project.Config;

import com.WebProject.Ecom_Project.Repository.UserRepo;
import com.WebProject.Ecom_Project.model.AppUser;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.Instant;

@Configuration
public class DataBootstrap {
    @Value("${app.bootstrap.admin-email:}")
    private String adminEmail;
    @Value("${app.bootstrap.admin-password:}")
    private String adminPassword;
    @Value("${app.bootstrap.admin-name:CampusBaazar Admin}")
    private String adminName;
    @Value("${app.bootstrap.admin-institution:CampusBaazar Operations}")
    private String adminInstitution;

    @Bean
    CommandLineRunner createAdmin(UserRepo users, PasswordEncoder encoder) {
        return args -> {
            if (adminEmail.isBlank() || adminPassword.isBlank()) return;
            AppUser admin = users.findByEmailIgnoreCase(adminEmail.trim()).orElseGet(AppUser::new);
            if (admin.getId() == null) {
                admin.setName(adminName.trim());
                admin.setEmail(adminEmail.trim().toLowerCase());
                admin.setCollegeEmail(adminEmail.trim().toLowerCase());
                admin.setInstitution(adminInstitution.trim());
                admin.setCreatedAt(Instant.now());
            }
            admin.setPassword(encoder.encode(adminPassword));
            admin.setRole("ADMIN");
            users.save(admin);
        };
    }
}
