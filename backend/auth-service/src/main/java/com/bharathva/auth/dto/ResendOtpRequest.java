package com.bharathva.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class ResendOtpRequest {
    
    @NotBlank(message = "Session token is required")
    private String sessionToken;

    // Constructors
    public ResendOtpRequest() {}

    public ResendOtpRequest(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    // Getters and Setters
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
}

