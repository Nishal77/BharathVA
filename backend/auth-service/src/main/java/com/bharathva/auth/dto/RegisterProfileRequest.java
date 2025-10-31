package com.bharathva.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterProfileRequest {
    @NotBlank
    private String sessionToken;

    @Size(max = 300)
    private String bio;

    private String profileImageUrl;

    @NotBlank
    private String gender; // Male, Female, Custom, Prefer not to say

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}



