package com.bharathva.auth.repository;

import com.bharathva.auth.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    
    // Find valid (non-expired) session by refresh token
    @Query("SELECT s FROM UserSession s WHERE s.refreshToken = :refreshToken AND s.expiresAt > :now")
    Optional<UserSession> findByRefreshTokenAndNotExpired(String refreshToken, LocalDateTime now);

    // Find session by refresh token (any state)
    Optional<UserSession> findByRefreshToken(String refreshToken);

    // Delete session by refresh token (logout)
    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.refreshToken = :refreshToken")
    void deleteByRefreshToken(String refreshToken);

    // Delete all sessions for a user (logout all devices)
    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.user.id = :userId")
    void deleteAllByUserId(UUID userId);

    // Count active (non-expired) sessions for a user
    @Query("SELECT COUNT(s) FROM UserSession s WHERE s.user.id = :userId AND s.expiresAt > :now")
    long countActiveSessionsByUserId(UUID userId, LocalDateTime now);

    // Find all active sessions for a user
    // CRITICAL: Order by last_used_at DESC to get the most recently used session first
    // This ensures we get the correct session when multiple sessions exist
    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId AND s.expiresAt > :now ORDER BY s.lastUsedAt DESC, s.createdAt DESC")
    List<UserSession> findActiveSessionsByUserId(UUID userId, LocalDateTime now);

    // Delete expired sessions (cleanup job)
    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < :now")
    void deleteExpiredSessions(LocalDateTime now);
}
