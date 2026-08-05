package com.WebProject.Ecom_Project.Controller;

import com.WebProject.Ecom_Project.Repository.UserRepo;
import com.WebProject.Ecom_Project.dto.AuthRequests;
import com.WebProject.Ecom_Project.model.AppUser;
import com.WebProject.Ecom_Project.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserRepo userRepo, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthRequests.Response register(@Valid @RequestBody AuthRequests.Register request) {
        if (userRepo.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists for this email");
        }
        if (userRepo.existsByCollegeEmailIgnoreCase(request.collegeEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This college email is already verified");
        }
        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setCollegeEmail(request.collegeEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setInstitution(request.institution().trim());
        user.setRole("STUDENT");
        user.setCreatedAt(Instant.now());
        userRepo.save(user);
        return response(user, jwtService.generateToken(user));
    }

    @PostMapping("/login")
    public AuthRequests.Response login(@Valid @RequestBody AuthRequests.Login request) {
        String email = request.email().trim().toLowerCase();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (AuthenticationException error) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email or password");
        }
        AppUser user = userRepo.findByEmailIgnoreCaseOrCollegeEmailIgnoreCase(email, email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Incorrect email or password"));
        return response(user, jwtService.generateToken(user));
    }

    @GetMapping("/me")
    public AuthRequests.Response me(@AuthenticationPrincipal AppUser user) {
        return response(user, null);
    }

    private AuthRequests.Response response(AppUser user, String token) {
        return new AuthRequests.Response(token, user.getId(), user.getName(), user.getEmail(), user.getCollegeEmail(),
                user.getInstitution(), user.effectiveRole(), user.getPhone(), user.getBio());
    }
}
