package com.bharathva.auth.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.bharathva.auth.util.LocalDateDeserializer;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class RegisterDetailsRequest {
    
    @NotBlank(message = "Session token is required")
    private String sessionToken;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    private String countryCode = "+91";
    
    @JsonDeserialize(using = LocalDateDeserializer.class)
    private LocalDate dateOfBirth;

    // Constructors
    public RegisterDetailsRequest() {}

    public RegisterDetailsRequest(String sessionToken, String fullName, String phoneNumber, 
                                 String countryCode, LocalDate dateOfBirth) {
        this.sessionToken = sessionToken;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.countryCode = countryCode;
        this.dateOfBirth = dateOfBirth;
    }

    // Getters and Setters
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}

