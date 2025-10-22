package com.bharathva.auth.controller;

import com.bharathva.auth.entity.User;
import com.bharathva.auth.repository.UserRepository;
import com.bharathva.auth.util.JwtUtils;
import com.bharathva.shared.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth/user")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        try {
            UUID userId = JwtUtils.getCurrentUserId();
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(
                        false,
                        "User not found",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            User user = userOptional.get();
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("email", user.getEmail());
            userData.put("username", user.getUsername());
            userData.put("fullName", user.getFullName());
            userData.put("phoneNumber", user.getPhoneNumber());
            userData.put("countryCode", user.getCountryCode());
            userData.put("dateOfBirth", user.getDateOfBirth());
            userData.put("isEmailVerified", user.getIsEmailVerified());
            userData.put("createdAt", user.getCreatedAt());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User profile retrieved successfully",
                    userData,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve user profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserById(@PathVariable UUID userId) {
        try {
            UUID currentUserId = JwtUtils.getCurrentUserId();
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(
                        false,
                        "User not found",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            User user = userOptional.get();
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("fullName", user.getFullName());
            userData.put("isEmailVerified", user.getIsEmailVerified());
            userData.put("createdAt", user.getCreatedAt());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User data retrieved successfully",
                    userData,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve user by ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserByUsername(@PathVariable String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(
                        false,
                        "User not found",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            User user = userOptional.get();
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("fullName", user.getFullName());
            userData.put("email", user.getEmail());
            userData.put("isEmailVerified", user.getIsEmailVerified());
            userData.put("createdAt", user.getCreatedAt());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User data retrieved successfully",
                    userData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve user by username: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PutMapping("/me/fullname")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateFullName(@RequestBody Map<String, String> request) {
        try {
            UUID userId = JwtUtils.getCurrentUserId();
            
            String newFullName = request.get("fullName");
            if (newFullName == null || newFullName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Full name is required",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(
                        false,
                        "User not found",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            User user = userOptional.get();
            String oldFullName = user.getFullName();
            user.setFullName(newFullName.trim());
            userRepository.save(user);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("oldFullName", oldFullName);
            responseData.put("newFullName", newFullName);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Full name updated successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Failed to update full name: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }
}
