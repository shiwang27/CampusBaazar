package com.WebProject.Ecom_Project.security;

import com.WebProject.Ecom_Project.model.AppUser;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    @Test
    void generatesAndValidatesTokenWithConfiguredSecret() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "local-development-secret");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 60_000L);

        AppUser user = new AppUser();
        user.setEmail("student@campus.edu");
        user.setName("Campus Student");

        String token = jwtService.generateToken(user);

        assertEquals(user.getEmail(), jwtService.extractUsername(token));
        assertTrue(jwtService.isValid(token, user));
    }
}
