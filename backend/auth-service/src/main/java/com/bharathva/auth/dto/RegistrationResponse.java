package com.bharathva.auth.dto;

public class RegistrationResponse {
    private String sessionToken;
    private String currentStep;
    private String message;
    private String email;

    // Constructors
    public RegistrationResponse() {}

    public RegistrationResponse(String sessionToken, String currentStep, String message, String email) {
        this.sessionToken = sessionToken;
        this.currentStep = currentStep;
        this.message = message;
        this.email = email;
    }

    // Getters and Setters
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public String getCurrentStep() { return currentStep; }
    public void setCurrentStep(String currentStep) { this.currentStep = currentStep; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}

