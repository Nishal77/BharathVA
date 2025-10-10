package com.bharathva.auth.repository;

import com.bharathva.auth.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findByEmailAndOtpCodeAndIsUsedFalseAndExpiryAfter(
            String email, String otpCode, LocalDateTime currentTime);
    
    void deleteByEmailAndExpiryBefore(String email, LocalDateTime currentTime);
    
    void deleteByEmail(String email);
}

