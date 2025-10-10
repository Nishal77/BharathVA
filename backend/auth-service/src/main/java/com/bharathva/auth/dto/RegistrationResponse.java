package com.bharathva.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private String sessionToken;
    private String currentStep;
    private String message;
    private String email;
}

