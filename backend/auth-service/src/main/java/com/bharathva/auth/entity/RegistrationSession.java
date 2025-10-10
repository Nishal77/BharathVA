package com.bharathva.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Temporary storage for registration data during the multi-step registration process
 */
@Entity
@Table(name = "registration_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_token", unique = true, nullable = false)
    private String sessionToken;
    
    @Column(name = "email", nullable = false, length = 150)
    private String email;
    
    @Column(name = "full_name", length = 100)
    private String fullName;
    
    @Column(name = "phone_number", length = 15)
    private String phoneNumber;
    
    @Column(name = "country_code", length = 5)
    private String countryCode;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "password_hash")
    private String passwordHash;
    
    @Column(name = "username", length = 50)
    private String username;
    
    @Column(name = "is_email_verified", nullable = false)
    private Boolean isEmailVerified = false;
    
    @Column(name = "current_step", nullable = false)
    private String currentStep; // EMAIL, OTP, PASSWORD, USERNAME, COMPLETED
    
    @Column(name = "expiry", nullable = false)
    private LocalDateTime expiry;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

