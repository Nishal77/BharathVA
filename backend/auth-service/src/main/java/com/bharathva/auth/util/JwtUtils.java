package com.bharathva.auth.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class JwtUtils {
    
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof String) {
            try {
                String userIdStr = (String) authentication.getPrincipal();
                return UUID.fromString(userIdStr);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid user ID in token");
            }
        }
        throw new RuntimeException("No authenticated user found");
    }
    
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && 
               !"anonymousUser".equals(authentication.getPrincipal());
    }
}
