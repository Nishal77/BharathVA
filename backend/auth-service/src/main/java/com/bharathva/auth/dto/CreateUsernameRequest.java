package com.bharathva.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateUsernameRequest {
    
    @NotBlank(message = "Session token is required")
    private String sessionToken;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-z0-9_]+$", message = "Username can only contain lowercase letters, numbers, and underscores")
    private String username;

    // Constructors
    public CreateUsernameRequest() {}

    public CreateUsernameRequest(String sessionToken, String username) {
        this.sessionToken = sessionToken;
        this.username = username;
    }

    // Getters and Setters
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}

