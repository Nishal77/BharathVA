package com.bharathva.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VerifyOtpRequest {
    
    @NotBlank(message = "Session token is required")
    private String sessionToken;
    
    @NotBlank(message = "OTP is required")
    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    private String otp;

    // Constructors
    public VerifyOtpRequest() {}

    public VerifyOtpRequest(String sessionToken, String otp) {
        this.sessionToken = sessionToken;
        this.otp = otp;
    }

    // Getters and Setters
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}

