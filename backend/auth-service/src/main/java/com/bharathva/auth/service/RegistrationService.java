package com.bharathva.auth.service;

import com.bharathva.auth.dto.*;
import com.bharathva.auth.entity.EmailOtp;
import com.bharathva.auth.entity.RegistrationSession;
import com.bharathva.auth.entity.User;
import com.bharathva.auth.repository.EmailOtpRepository;
import com.bharathva.auth.repository.RegistrationSessionRepository;
import com.bharathva.auth.repository.UserRepository;
import com.bharathva.shared.exception.BusinessException;
import com.bharathva.shared.util.OTPGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final UserRepository userRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final RegistrationSessionRepository registrationSessionRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    /**
     * Step 1: Register Email
     * - Validate email doesn't exist
     * - Create registration session
     * - Generate and send OTP
     */
    @Transactional
    public RegistrationResponse registerEmail(RegisterEmailRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Check if email already registered
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("Email is already registered. Please login instead.");
        }

        // Check if there's an existing session for this email
        registrationSessionRepository.findByEmail(email)
                .ifPresent(session -> {
                    // Delete old session and its OTPs
                    emailOtpRepository.deleteByEmail(email);
                    registrationSessionRepository.delete(session);
                });

        // Create new registration session
        String sessionToken = UUID.randomUUID().toString();
        RegistrationSession session = RegistrationSession.builder()
                .sessionToken(sessionToken)
                .email(email)
                .currentStep("EMAIL")
                .isEmailVerified(false)
                .expiry(LocalDateTime.now().plusHours(24)) // Session valid for 24 hours
                .build();

        registrationSessionRepository.save(session);

        // Generate and send OTP
        String otp = OTPGenerator.generateSixDigitOTP();
        EmailOtp emailOtp = EmailOtp.builder()
                .email(email)
                .otpCode(otp)
                .expiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .isUsed(false)
                .build();

        emailOtpRepository.save(emailOtp);
        emailService.sendOtpEmail(email, otp);

        log.info("Registration initiated for email: {}", email);

        return RegistrationResponse.builder()
                .sessionToken(sessionToken)
                .currentStep("OTP")
                .email(email)
                .message("OTP sent to your email. Please verify.")
                .build();
    }

    /**
     * Step 2: Save User Details
     * - Validate session
     * - Save name, phone, DOB
     */
    @Transactional
    public RegistrationResponse saveUserDetails(RegisterDetailsRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("OTP")) {
            throw new BusinessException("Invalid registration step. Please verify OTP first.");
        }

        if (!session.getIsEmailVerified()) {
            throw new BusinessException("Please verify your email with OTP first.");
        }

        // Update session with user details
        session.setFullName(request.getFullName().trim());
        session.setPhoneNumber(request.getPhoneNumber().trim());
        session.setCountryCode(request.getCountryCode());
        session.setDateOfBirth(request.getDateOfBirth());
        session.setCurrentStep("DETAILS");

        registrationSessionRepository.save(session);

        log.info("User details saved for session: {}", session.getSessionToken());

        return RegistrationResponse.builder()
                .sessionToken(session.getSessionToken())
                .currentStep("PASSWORD")
                .message("Details saved. Please create a password.")
                .build();
    }

    /**
     * Step 3: Verify OTP
     * - Validate OTP
     * - Mark email as verified
     */
    @Transactional
    public RegistrationResponse verifyOtp(VerifyOtpRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("EMAIL")) {
            throw new BusinessException("Invalid registration step.");
        }

        // Find valid OTP
        EmailOtp emailOtp = emailOtpRepository
                .findByEmailAndOtpCodeAndIsUsedFalseAndExpiryAfter(
                        session.getEmail(),
                        request.getOtp(),
                        LocalDateTime.now()
                )
                .orElseThrow(() -> new BusinessException("Invalid or expired OTP"));

        // Mark OTP as used
        emailOtp.setIsUsed(true);
        emailOtpRepository.save(emailOtp);

        // Mark email as verified in session
        session.setIsEmailVerified(true);
        session.setCurrentStep("OTP");
        registrationSessionRepository.save(session);

        // Clean up old OTPs
        emailOtpRepository.deleteByEmail(session.getEmail());

        log.info("Email verified for session: {}", session.getSessionToken());

        return RegistrationResponse.builder()
                .sessionToken(session.getSessionToken())
                .currentStep("DETAILS")
                .message("Email verified successfully. Please provide your details.")
                .build();
    }

    /**
     * Step 4: Create Password
     * - Validate session
     * - Hash and save password
     */
    @Transactional
    public RegistrationResponse createPassword(CreatePasswordRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("DETAILS")) {
            throw new BusinessException("Invalid registration step. Please provide details first.");
        }

        // Validate password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Passwords do not match");
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        session.setPasswordHash(hashedPassword);
        session.setCurrentStep("PASSWORD");

        registrationSessionRepository.save(session);

        log.info("Password created for session: {}", session.getSessionToken());

        return RegistrationResponse.builder()
                .sessionToken(session.getSessionToken())
                .currentStep("USERNAME")
                .message("Password created. Please choose a username.")
                .build();
    }

    /**
     * Step 5: Create Username and Complete Registration
     * - Validate username availability
     * - Create final user account
     * - Clean up session
     */
    @Transactional
    public RegistrationResponse createUsername(CreateUsernameRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("PASSWORD")) {
            throw new BusinessException("Invalid registration step. Please create password first.");
        }

        String username = request.getUsername().toLowerCase().trim();

        // Check username availability
        if (userRepository.existsByUsername(username)) {
            throw new BusinessException("Username is already taken. Please choose another.");
        }

        // Create final user account
        User user = User.builder()
                .fullName(session.getFullName())
                .username(username)
                .email(session.getEmail())
                .phoneNumber(session.getPhoneNumber())
                .countryCode(session.getCountryCode())
                .dateOfBirth(session.getDateOfBirth())
                .passwordHash(session.getPasswordHash())
                .isEmailVerified(true)
                .build();

        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());

        // Clean up session
        registrationSessionRepository.delete(session);

        log.info("User registration completed: {} ({})", user.getUsername(), user.getEmail());

        return RegistrationResponse.builder()
                .sessionToken(null)
                .currentStep("COMPLETED")
                .message("Registration completed successfully! Welcome to BharathVA!")
                .build();
    }

    /**
     * Resend OTP
     */
    @Transactional
    public RegistrationResponse resendOtp(ResendOtpRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("EMAIL")) {
            throw new BusinessException("OTP can only be resent during email verification step.");
        }

        // Delete old OTPs
        emailOtpRepository.deleteByEmail(session.getEmail());

        // Generate new OTP
        String otp = OTPGenerator.generateSixDigitOTP();
        EmailOtp emailOtp = EmailOtp.builder()
                .email(session.getEmail())
                .otpCode(otp)
                .expiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .isUsed(false)
                .build();

        emailOtpRepository.save(emailOtp);
        emailService.sendOtpEmail(session.getEmail(), otp);

        log.info("OTP resent for session: {}", session.getSessionToken());

        return RegistrationResponse.builder()
                .sessionToken(session.getSessionToken())
                .currentStep("OTP")
                .message("New OTP sent to your email.")
                .build();
    }

    /**
     * Check username availability
     */
    public boolean checkUsernameAvailability(String username) {
        return !userRepository.existsByUsername(username.toLowerCase().trim());
    }

    /**
     * Helper method to get and validate session
     */
    private RegistrationSession getValidSession(String sessionToken) {
        RegistrationSession session = registrationSessionRepository
                .findBySessionToken(sessionToken)
                .orElseThrow(() -> new BusinessException("Invalid or expired session"));

        if (session.getExpiry().isBefore(LocalDateTime.now())) {
            registrationSessionRepository.delete(session);
            throw new BusinessException("Session expired. Please start registration again.");
        }

        return session;
    }
}

