package com.upforit.demo.controller;

import com.upforit.demo.model.User;
import com.upforit.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        User existing = userRepository.findByEmail(user.getEmail());
        if (existing != null) {
            return ResponseEntity.status(409).body(Map.of("message", "An account with this email already exists"));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        User existingUser = userRepository.findByEmail(loginRequest.getEmail());

        if (existingUser == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        boolean matches = passwordEncoder.matches(loginRequest.getPassword(), existingUser.getPassword());

        if (!matches) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid password"));
        }

        existingUser.setPassword(null);
        return ResponseEntity.ok(existingUser);
    }
}