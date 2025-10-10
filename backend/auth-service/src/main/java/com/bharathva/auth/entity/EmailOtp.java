package com.bharathva.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_otps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailOtp {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
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
}

