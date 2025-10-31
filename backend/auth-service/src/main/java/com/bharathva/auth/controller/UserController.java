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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.bharathva.auth.service.CloudinaryService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
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

    @Autowired
    private CloudinaryService cloudinaryService;

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
            userData.put("profileImageUrl", user.getProfileImageUrl());
            userData.put("bio", user.getBio());
            userData.put("gender", user.getGender());
            
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

    @PostMapping(value = "/me/profile-image", consumes = "multipart/form-data", produces = "application/json")
    @PutMapping(value = "/me/profile-image", consumes = "multipart/form-data", produces = "application/json")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfileImage(
            @RequestParam("file") MultipartFile file,
            jakarta.servlet.http.HttpServletRequest request) {
        System.out.println("📤 [UserController] Received profile image upload request");
        
        try {
            log.info("Received profile image upload request");
            
            // Check authentication
            String authHeader = request.getHeader("Authorization");
            boolean hasAuth = authHeader != null && authHeader.startsWith("Bearer ");
            log.info("Authorization header present: {}", hasAuth);
            System.out.println("🔐 [UserController] Authorization header present: " + hasAuth);
            
            if (!JwtUtils.isAuthenticated()) {
                log.warn("Unauthenticated request to profile image upload");
                System.err.println("❌ [UserController] Unauthenticated request");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                        false,
                        "Authentication required",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            UUID userId = JwtUtils.getCurrentUserId();
            log.info("Current user ID: {}", userId);
            System.out.println("👤 [UserController] Current user ID: " + userId);
            
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                log.warn("User not found: {}", userId);
                System.err.println("❌ [UserController] User not found: " + userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(
                        false,
                        "User not found",
                        null,
                        LocalDateTime.now()
                ));
            }

            if (file == null || file.isEmpty()) {
                log.warn("Empty or null file received");
                System.err.println("❌ [UserController] Empty or null file received");
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Image file is required",
                        null,
                        LocalDateTime.now()
                ));
            }

            // Validate file size (max 10MB)
            long maxSize = 10 * 1024 * 1024; // 10MB
            long fileSize = file.getSize();
            if (fileSize > maxSize) {
                log.warn("File too large: {} bytes", fileSize);
                System.err.println("❌ [UserController] File too large: " + fileSize + " bytes (max: " + maxSize + ")");
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "File size exceeds 10MB limit",
                        null,
                        LocalDateTime.now()
                ));
            }

            // Accept any file type - Cloudinary will handle validation
            String contentType = file.getContentType();
            String filename = file.getOriginalFilename();
            log.info("Uploading file to Cloudinary: name={}, size={}, contentType={}", 
                    filename, fileSize, contentType);
            System.out.println("📤 [UserController] Uploading file to Cloudinary:");
            System.out.println("   - Name: " + filename);
            System.out.println("   - Size: " + fileSize + " bytes");
            System.out.println("   - ContentType: " + contentType);
            
            String url;
            try {
                System.out.println("🔄 [UserController] Calling cloudinaryService.uploadProfileImage()...");
                url = cloudinaryService.uploadProfileImage(file);
                System.out.println("✅ [UserController] Cloudinary upload successful, URL: " + url);
            } catch (Exception e) {
                log.error("Cloudinary upload error: {}", e.getMessage(), e);
                System.err.println("❌ [UserController] Cloudinary upload error: " + e.getClass().getName() + " - " + e.getMessage());
                e.printStackTrace();
                if (e.getCause() != null) {
                    System.err.println("📋 [UserController] Cause: " + e.getCause().getMessage());
                    e.getCause().printStackTrace();
                }
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(
                        false,
                        "Failed to upload image: " + e.getMessage(),
                        null,
                        LocalDateTime.now()
                ));
            }
            
            if (url == null || url.isEmpty()) {
                log.error("Cloudinary upload returned null or empty URL");
                System.err.println("❌ [UserController] Cloudinary upload returned null or empty URL");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                        false,
                        "Failed to upload image",
                        null,
                        LocalDateTime.now()
                ));
            }

            log.info("Cloudinary upload successful: {}", url);
            
            User user = userOptional.get();
            String old = user.getProfileImageUrl();
            System.out.println("💾 [UserController] Updating database:");
            System.out.println("   - Old profileImageUrl: " + old);
            System.out.println("   - New profileImageUrl: " + url);
            
            user.setProfileImageUrl(url);
            userRepository.save(user);
            
            log.info("Profile image updated for user {}: old={}, new={}", userId, old, url);
            System.out.println("✅ [UserController] Profile image updated successfully for user: " + userId);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("profileImageUrl", url);
            responseData.put("oldProfileImageUrl", old != null ? old : "");
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Profile image updated",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            log.error("RuntimeException in updateProfileImage: {}", e.getMessage(), e);
            System.err.println("❌ [UserController] RuntimeException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Failed to update profile image: {}", e.getMessage(), e);
            System.err.println("❌ [UserController] Exception: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred: " + e.getMessage(),
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PutMapping(value = "/me/bio", consumes = "application/json", produces = "application/json")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBioOnly(@RequestBody Map<String, Object> request) {
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
            String bio = request.get("bio") == null ? null : String.valueOf(request.get("bio"));
            String sanitized = bio != null ? bio.trim() : null;
            if (sanitized != null && sanitized.isEmpty()) sanitized = null;
            if (sanitized != null && sanitized.length() > 150) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Bio must be at most 150 characters",
                        null,
                        LocalDateTime.now()
                ));
            }

            String old = user.getBio();
            if ((old == null && sanitized == null) || (old != null && old.equals(sanitized))) {
                return ResponseEntity.ok(new ApiResponse<>(
                        true,
                        "No changes",
                        Map.of("bio", sanitized),
                        LocalDateTime.now()
                ));
            }

            user.setBio(sanitized);
            log.info("Updating bio only: userId={}, oldBioLength={}, newBioLength={}", user.getId(), old == null ? 0 : old.length(), sanitized == null ? 0 : sanitized.length());
            userRepository.save(user);

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Bio updated",
                    Map.of("bio", sanitized),
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
            log.error("Failed to update bio only: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PutMapping("/me/bio")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBio(@RequestBody Map<String, Object> request) {
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
            String newBio = null;
            if (request.containsKey("bio") && request.get("bio") != null) {
                newBio = String.valueOf(request.get("bio"));
                if (newBio != null) {
                    newBio = newBio.trim();
                }
            }

            String oldBio = user.getBio();
            user.setBio((newBio != null && !newBio.isEmpty()) ? newBio : null);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("oldBio", oldBio);
            response.put("newBio", user.getBio());

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Bio updated successfully",
                    response,
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
            log.error("Failed to update bio: {}", e.getMessage());
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
            userData.put("profileImageUrl", user.getProfileImageUrl());
            userData.put("bio", user.getBio());
            userData.put("gender", user.getGender());
            
            log.info("Retrieved user profile for userId: {}, profileImageUrl: {}", userId, user.getProfileImageUrl());
            
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

    @PutMapping("/me/username")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUsername(@RequestBody Map<String, String> request) {
        try {
            UUID userId = JwtUtils.getCurrentUserId();
            
            String newUsername = request.get("username");
            if (newUsername == null || newUsername.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Username is required",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            // Validate username format (3-50 characters, alphanumeric + underscore)
            String trimmedUsername = newUsername.trim().toLowerCase();
            if (trimmedUsername.length() < 3 || trimmedUsername.length() > 50) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Username must be between 3 and 50 characters",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            if (!trimmedUsername.matches("^[a-z0-9_]+$")) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Username can only contain lowercase letters, numbers, and underscores",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            // Check if username already exists
            Optional<User> existingUser = userRepository.findByUsername(trimmedUsername);
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Username already taken",
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
            String oldUsername = user.getUsername();
            user.setUsername(trimmedUsername);
            userRepository.save(user);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("oldUsername", oldUsername);
            responseData.put("newUsername", trimmedUsername);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Username updated successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Failed to update username: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PutMapping("/me/dateofbirth")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateDateOfBirth(@RequestBody Map<String, String> request) {
        try {
            UUID userId = JwtUtils.getCurrentUserId();
            
            String dateOfBirthStr = request.get("dateOfBirth");
            if (dateOfBirthStr == null || dateOfBirthStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Date of birth is required",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            LocalDate dateOfBirth;
            try {
                // Try parsing as ISO date (YYYY-MM-DD)
                dateOfBirth = LocalDate.parse(dateOfBirthStr.trim());
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Invalid date format. Please use YYYY-MM-DD format",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            // Validate date is not in the future
            if (dateOfBirth.isAfter(LocalDate.now())) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Date of birth cannot be in the future",
                        null,
                        LocalDateTime.now()
                ));
            }
            
            // Validate reasonable age (not older than 150 years)
            if (dateOfBirth.isBefore(LocalDate.now().minusYears(150))) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        false,
                        "Date of birth is too far in the past",
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
            LocalDate oldDateOfBirth = user.getDateOfBirth();
            user.setDateOfBirth(dateOfBirth);
            userRepository.save(user);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("oldDateOfBirth", oldDateOfBirth);
            responseData.put("newDateOfBirth", dateOfBirth);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Date of birth updated successfully",
                    responseData,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Failed to update date of birth: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred",
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    @PutMapping(value = "/me/profile", consumes = "application/json", produces = "application/json")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(@RequestBody Map<String, Object> request) {
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
            log.info("Received updateProfile request: userId={}, payload={}", userId, request);

            User user = userOptional.get();
            Map<String, Object> changes = new HashMap<>();
            boolean anyChange = false;
            
            // Update full name if provided
            if (request.containsKey("fullName")) {
                String fullName = (String) request.get("fullName");
                if (fullName != null && !fullName.trim().isEmpty()) {
                    String oldFullName = user.getFullName();
                    user.setFullName(fullName.trim());
                    changes.put("fullName", Map.of("old", oldFullName, "new", fullName.trim()));
                    anyChange = true;
                }
            }
            
            // Update username if provided
            if (request.containsKey("username")) {
                String username = (String) request.get("username");
                if (username != null && !username.trim().isEmpty()) {
                    String trimmedUsername = username.trim().toLowerCase();
                    
                    // Validate username format
                    if (trimmedUsername.length() < 3 || trimmedUsername.length() > 50) {
                        return ResponseEntity.badRequest().body(new ApiResponse<>(
                                false,
                                "Username must be between 3 and 50 characters",
                                null,
                                LocalDateTime.now()
                        ));
                    }
                    
                    if (!trimmedUsername.matches("^[a-z0-9_]+$")) {
                        return ResponseEntity.badRequest().body(new ApiResponse<>(
                                false,
                                "Username can only contain lowercase letters, numbers, and underscores",
                                null,
                                LocalDateTime.now()
                        ));
                    }
                    
                    // Check if username already exists
                    Optional<User> existingUser = userRepository.findByUsername(trimmedUsername);
                    if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                        return ResponseEntity.badRequest().body(new ApiResponse<>(
                                false,
                                "Username already taken",
                                null,
                                LocalDateTime.now()
                        ));
                    }
                    
                    String oldUsername = user.getUsername();
                    user.setUsername(trimmedUsername);
                    changes.put("username", Map.of("old", oldUsername, "new", trimmedUsername));
                    anyChange = true;
                }
            }
            
            // Update date of birth if provided
            if (request.containsKey("dateOfBirth")) {
                String dateOfBirthStr = (String) request.get("dateOfBirth");
                if (dateOfBirthStr != null && !dateOfBirthStr.trim().isEmpty()) {
                    try {
                        LocalDate dateOfBirth = LocalDate.parse(dateOfBirthStr.trim());
                        
                        // Validate date
                        if (dateOfBirth.isAfter(LocalDate.now())) {
                            return ResponseEntity.badRequest().body(new ApiResponse<>(
                                    false,
                                    "Date of birth cannot be in the future",
                                    null,
                                    LocalDateTime.now()
                            ));
                        }
                        
                        if (dateOfBirth.isBefore(LocalDate.now().minusYears(150))) {
                            return ResponseEntity.badRequest().body(new ApiResponse<>(
                                    false,
                                    "Date of birth is too far in the past",
                                    null,
                                    LocalDateTime.now()
                            ));
                        }
                        
                        LocalDate oldDateOfBirth = user.getDateOfBirth();
                        user.setDateOfBirth(dateOfBirth);
                        changes.put("dateOfBirth", Map.of("old", oldDateOfBirth, "new", dateOfBirth));
                        anyChange = true;
                    } catch (DateTimeParseException e) {
                        return ResponseEntity.badRequest().body(new ApiResponse<>(
                                false,
                                "Invalid date format. Please use YYYY-MM-DD format",
                                null,
                                LocalDateTime.now()
                        ));
                    }
                }
            }

            // Profile-specific fields
            if (request.containsKey("profileImageUrl")) {
                log.info("Processing profileImageUrl update: userId={}, requestValue={}", userId, request.get("profileImageUrl"));
                
                Object profileImageUrlObj = request.get("profileImageUrl");
                String profileImageUrl = null;
                
                // Handle null explicitly - allow deletion by setting to null
                // JSON null becomes Java null, empty string also means deletion
                if (profileImageUrlObj == null) {
                    profileImageUrl = null; // Explicit deletion
                    log.info("profileImageUrlObj is null, setting profileImageUrl to null for deletion");
                } else if (profileImageUrlObj instanceof String) {
                    String strValue = ((String) profileImageUrlObj).trim();
                    // Empty string also means deletion
                    profileImageUrl = strValue.isEmpty() ? null : strValue;
                    log.info("profileImageUrlObj is String: '{}', setting profileImageUrl to: {}", strValue, profileImageUrl);
                } else {
                    // Unexpected type, treat as null (deletion)
                    profileImageUrl = null;
                    log.warn("Unexpected profileImageUrl type: {}, treating as null", profileImageUrlObj.getClass().getName());
                }
                
                String oldProfileImageUrl = user.getProfileImageUrl();
                log.info("Current profileImageUrl from database: {}", oldProfileImageUrl);
                
                // Only update if value has changed (allows setting to null for deletion)
                boolean changed = false;
                if (oldProfileImageUrl == null && profileImageUrl != null) {
                    changed = true; // Setting a value where none existed
                } else if (oldProfileImageUrl != null && !oldProfileImageUrl.equals(profileImageUrl)) {
                    changed = true; // Changing value or deleting (profileImageUrl is null)
                }
                // If both are null, no change needed
                
                if (changed) {
                    // If deleting (profileImageUrl is null and old exists), delete from Cloudinary
                    if (profileImageUrl == null && oldProfileImageUrl != null && oldProfileImageUrl.contains("cloudinary.com")) {
                        String extractedPublicId = null;
                        try {
                            // Extract public ID from Cloudinary URL
                            // Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
                            extractedPublicId = extractCloudinaryPublicId(oldProfileImageUrl);
                            if (extractedPublicId != null && !extractedPublicId.isEmpty()) {
                                log.info("Deleting old profile image from Cloudinary: publicId={}, url={}", extractedPublicId, oldProfileImageUrl);
                                cloudinaryService.deleteImage(extractedPublicId);
                                log.info("Successfully deleted image from Cloudinary: publicId={}", extractedPublicId);
                            } else {
                                log.warn("Could not extract public ID from Cloudinary URL: {}", oldProfileImageUrl);
                            }
                        } catch (Exception e) {
                            // Log error but don't fail the profile update
                            // The image is already deleted from database, Cloudinary cleanup is best-effort
                            log.error("Failed to delete image from Cloudinary (continuing with profile update): url={}, publicId={}, error={}", 
                                    oldProfileImageUrl, extractedPublicId, e.getMessage(), e);
                        }
                    }
                    
                    // Update user entity with new profileImageUrl (can be null for deletion)
                    try {
                        user.setProfileImageUrl(profileImageUrl);
                        log.debug("Set profileImageUrl on user entity: userId={}, value={}", userId, profileImageUrl);
                    } catch (Exception e) {
                        log.error("Failed to set profileImageUrl on user entity: userId={}, error={}", userId, e.getMessage(), e);
                        throw new RuntimeException("Failed to update profile image URL: " + e.getMessage(), e);
                    }
                    
                    // Build changes map safely handling null values
                    Map<String, String> profileImageChange = new HashMap<>();
                    profileImageChange.put("old", oldProfileImageUrl != null ? oldProfileImageUrl : "");
                    profileImageChange.put("new", profileImageUrl != null ? profileImageUrl : "");
                    changes.put("profileImageUrl", profileImageChange);
                    
                    anyChange = true;
                    log.info("Updating profileImageUrl: userId={}, old={}, new={}", userId, oldProfileImageUrl, profileImageUrl);
                }
            }

            if (request.containsKey("bio")) {
                String bio = (String) request.get("bio");
                String sanitized = bio != null ? bio.trim() : null;
                if (sanitized != null && sanitized.isEmpty()) {
                    sanitized = null; // treat empty as null
                }
                // Enforce database limit to avoid SQL errors (150 chars)
                if (sanitized != null && sanitized.length() > 150) {
                    return ResponseEntity.badRequest().body(new ApiResponse<>(
                            false,
                            "Bio must be at most 150 characters",
                            null,
                            LocalDateTime.now()
                    ));
                }
                String old = user.getBio();
                if ((old == null && sanitized != null) || (old != null && !old.equals(sanitized))) {
                    user.setBio(sanitized);
                    changes.put("bio", Map.of("old", old, "new", sanitized));
                    anyChange = true;
                }
            }

            if (request.containsKey("gender")) {
                String gender = (String) request.get("gender");
                String normalized = gender != null ? gender.trim().toLowerCase() : null;
                // If gender provided but empty, ignore instead of erroring
                if (normalized != null && !normalized.isEmpty()) {
                    if (!(normalized.equals("male") || normalized.equals("female") || normalized.equals("custom") || normalized.equals("prefer not to say"))) {
                        return ResponseEntity.badRequest().body(new ApiResponse<>(
                                false,
                                "Invalid gender value",
                                null,
                                LocalDateTime.now()
                        ));
                    }
                    String old = user.getGender();
                    if ((old == null && normalized != null) || (old != null && !old.equals(normalized))) {
                        user.setGender(normalized);
                        changes.put("gender", Map.of("old", old, "new", normalized));
                        anyChange = true;
                    }
                }
            }
            
            if (anyChange) {
                log.info("Updating profile: userId={}, changes={}", user.getId(), changes);
                log.info("User entity state before save: profileImageUrl={}, bio={}, gender={}", 
                        user.getProfileImageUrl(), user.getBio(), user.getGender());
                try {
                    User savedUser = userRepository.save(user);
                    log.info("Profile updated successfully for userId={}, saved profileImageUrl={}", 
                            savedUser.getId(), savedUser.getProfileImageUrl());
                } catch (Exception e) {
                    log.error("Database save failed for userId={}: {}", user.getId(), e.getMessage(), e);
                    log.error("Exception details: class={}, cause={}", e.getClass().getName(), e.getCause());
                    if (e.getCause() != null) {
                        log.error("Root cause: {}", e.getCause().getMessage(), e.getCause());
                    }
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                            false,
                            "Failed to save profile changes: " + e.getMessage(),
                            null,
                            LocalDateTime.now()
                    ));
                }
            } else {
                log.info("No profile changes detected for userId={}", user.getId());
            }
            
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Profile updated successfully",
                    changes,
                    LocalDateTime.now()
            ));
        } catch (RuntimeException e) {
            UUID userIdForLog = null;
            try {
                userIdForLog = JwtUtils.getCurrentUserId();
            } catch (Exception ex) {
                // Ignore - we're already in error handling
            }
            log.error("RuntimeException in updateProfile: userId={}, error={}, stackTrace={}", 
                    userIdForLog, e.getMessage(), getStackTrace(e), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(
                    false,
                    "Authentication error: " + (e.getMessage() != null ? e.getMessage() : "Unauthorized"),
                    null,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            UUID userIdForLog = null;
            try {
                userIdForLog = JwtUtils.getCurrentUserId();
            } catch (Exception ex) {
                // Ignore - we're already in error handling
            }
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.trim().isEmpty()) {
                errorMessage = e.getClass().getSimpleName();
            }
            log.error("Failed to update profile: userId={}, error={}, class={}, cause={}, stackTrace={}", 
                    userIdForLog, errorMessage, e.getClass().getName(), 
                    e.getCause() != null ? e.getCause().getMessage() : "null", getStackTrace(e), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    false,
                    "An unexpected error occurred: " + errorMessage,
                    null,
                    LocalDateTime.now()
            ));
        }
    }

    /**
     * Get stack trace as string for logging
     */
    private String getStackTrace(Throwable e) {
        if (e == null) {
            return "null";
        }
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }

    /**
     * Extract Cloudinary public ID from a Cloudinary URL
     * Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
     * Example: https://res.cloudinary.com/dqmryiyhz/image/upload/v1761887353/profile/zoj6zk6zeu7bik43gv7c.jpg
     * Returns: profile/zoj6zk6zeu7bik43gv7c
     * 
     * @param cloudinaryUrl The full Cloudinary URL
     * @return The public ID including folder, or null if extraction fails
     */
    private String extractCloudinaryPublicId(String cloudinaryUrl) {
        try {
            if (cloudinaryUrl == null || cloudinaryUrl.trim().isEmpty() || !cloudinaryUrl.contains("cloudinary.com")) {
                return null;
            }
            
            // Extract the path after /image/upload/
            // Format: /image/upload/v{version}/{folder}/{public_id}.{format}
            int uploadIndex = cloudinaryUrl.indexOf("/image/upload/");
            if (uploadIndex == -1) {
                return null;
            }
            
            String pathAfterUpload = cloudinaryUrl.substring(uploadIndex + "/image/upload/".length());
            
            // Remove version prefix (v{timestamp}/)
            int firstSlashIndex = pathAfterUpload.indexOf('/');
            if (firstSlashIndex == -1) {
                return null;
            }
            
            String afterVersion = pathAfterUpload.substring(firstSlashIndex + 1);
            
            // Remove file extension
            int lastDotIndex = afterVersion.lastIndexOf('.');
            if (lastDotIndex != -1) {
                afterVersion = afterVersion.substring(0, lastDotIndex);
            }
            
            // Return folder/public_id format
            return afterVersion;
        } catch (Exception e) {
            log.error("Failed to extract Cloudinary public ID from URL: {}", cloudinaryUrl, e);
            return null;
        }
    }
}
