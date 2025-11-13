package com.bharathva.auth.repository;

import com.bharathva.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY " +
           "CASE WHEN LOWER(u.username) = LOWER(:query) THEN 1 " +
           "WHEN LOWER(u.username) LIKE LOWER(CONCAT(:query, '%')) THEN 2 " +
           "WHEN LOWER(u.fullName) LIKE LOWER(CONCAT(:query, '%')) THEN 3 " +
           "ELSE 4 END, " +
           "u.username ASC")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);
    
    @Query(value = "SELECT * FROM users ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<User> findRandomUsers(@Param("limit") int limit);
}
