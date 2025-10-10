package com.bharathva.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_otps")
public class EmailOtp {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;
    
    @Column(name = "email", nullable = false, length = 150)
    private String email;
    
    @Column(name = "otp_code", nullable = false, length = 10)
    private String otpCode;
    
    @Column(name = "expiry", nullable = false)
    private LocalDateTime expiry;
    
    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public EmailOtp() {}

    public EmailOtp(UUID id, String email, String otpCode, LocalDateTime expiry, 
                   Boolean isUsed, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.otpCode = otpCode;
        this.expiry = expiry;
        this.isUsed = isUsed;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getExpiry() { return expiry; }
    public void setExpiry(LocalDateTime expiry) { this.expiry = expiry; }

    public Boolean getIsUsed() { return isUsed; }
    public void setIsUsed(Boolean isUsed) { this.isUsed = isUsed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

