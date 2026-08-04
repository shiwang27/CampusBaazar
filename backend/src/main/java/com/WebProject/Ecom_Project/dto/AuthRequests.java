package com.WebProject.Ecom_Project.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthRequests {
    private AuthRequests() {}

    public record Register(
            @NotBlank @Size(min = 2, max = 80) String name,
            @NotBlank @Email String email,
            @NotBlank @Email String collegeEmail,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(max = 120) String institution
    ) {}

    public record Login(@NotBlank @Email String email, @NotBlank String password) {}

    public record Response(String token, Long userId, String name, String email, String collegeEmail,
                           String institution, String role, String phone, String bio) {}
}
