package com.bharathva.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class CompleteRegistrationRequest {
    @NotBlank
    private String sessionToken;

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
}



