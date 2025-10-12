package com.bharathva.auth.repository;

import com.bharathva.auth.entity.RegistrationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationSessionRepository extends JpaRepository<RegistrationSession, UUID> {
    Optional<RegistrationSession> findBySessionToken(String sessionToken);
    Optional<RegistrationSession> findByEmail(String email);
    void deleteByExpiryBefore(LocalDateTime currentTime);
}

