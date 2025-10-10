package com.bharathva.auth.dto;

import java.util.UUID;

public class LoginResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private UUID userId;
    private String email;
    private String username;
    private long expiresIn;
    private String message;

    public LoginResponse() {}

    public LoginResponse(String token, UUID userId, String email, String username, long expiresIn, String message) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.expiresIn = expiresIn;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
