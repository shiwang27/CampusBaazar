package com.WebProject.Ecom_Project.Repository;

import com.WebProject.Ecom_Project.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByCollegeEmailIgnoreCase(String collegeEmail);
}
