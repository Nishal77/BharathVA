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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RegistrationService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailOtpRepository emailOtpRepository;
    
    @Autowired
    private RegistrationSessionRepository registrationSessionRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

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
        RegistrationSession session = new RegistrationSession();
        session.setSessionToken(sessionToken);
        session.setEmail(email);
        session.setCurrentStep("EMAIL");
        session.setIsEmailVerified(false);
        session.setExpiry(LocalDateTime.now().plusHours(24)); // Session valid for 24 hours

        registrationSessionRepository.save(session);

        // Generate and send OTP
        String otp = OTPGenerator.generateSixDigitOTP();
        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtpCode(otp);
        emailOtp.setExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        emailOtp.setIsUsed(false);

        emailOtpRepository.save(emailOtp);
        emailService.sendOtpEmail(email, otp);

        System.out.println("Registration initiated for email: " + email);

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(sessionToken);
        response.setCurrentStep("OTP");
        response.setEmail(email);
        response.setMessage("OTP sent to your email. Please verify.");
        return response;
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

        System.out.println("===========================================");
        System.out.println("👤 USER DETAILS SAVED");
        System.out.println("===========================================");
        System.out.println("📧 Email: " + session.getEmail());
        System.out.println("📛 Full Name: " + session.getFullName());
        System.out.println("📱 Phone: " + session.getPhoneNumber());
        System.out.println("🌍 Country Code: " + session.getCountryCode());
        System.out.println("📅 Date of Birth: " + session.getDateOfBirth());
        System.out.println("🔑 Session Token: " + session.getSessionToken());
        System.out.println("===========================================");

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(session.getSessionToken());
        response.setCurrentStep("PASSWORD");
        response.setMessage("Details saved. Please create a password.");
        return response;
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

        System.out.println("Email verified for session: " + session.getSessionToken());

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(session.getSessionToken());
        response.setCurrentStep("DETAILS");
        response.setMessage("Email verified successfully. Please provide your details.");
        return response;
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
        System.out.println("===========================================");
        System.out.println("🔐 HASHING PASSWORD");
        System.out.println("===========================================");
        System.out.println("📧 Email: " + session.getEmail());
        System.out.println("🔑 Plain password length: " + request.getPassword().length() + " characters");
        
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        
        System.out.println("✅ Password hashed successfully");
        System.out.println("🔒 Hash format: " + hashedPassword.substring(0, Math.min(20, hashedPassword.length())) + "...");
        System.out.println("📊 Hash length: " + hashedPassword.length() + " characters");
        System.out.println("===========================================");
        
        session.setPasswordHash(hashedPassword);
        session.setCurrentStep("PASSWORD");

        registrationSessionRepository.save(session);

        System.out.println("💾 Password hash saved to registration session");

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(session.getSessionToken());
        response.setCurrentStep("USERNAME");
        response.setMessage("Password created. Please choose a username.");
        return response;
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
        System.out.println("===========================================");
        System.out.println("👤 CREATING USER ACCOUNT");
        System.out.println("===========================================");
        System.out.println("📧 Email: " + session.getEmail());
        System.out.println("👤 Username: " + username);
        System.out.println("📛 Full Name: '" + session.getFullName() + "'");
        System.out.println("📛 Full Name Length: " + (session.getFullName() != null ? session.getFullName().length() : "NULL") + " characters");
        System.out.println("📱 Phone: " + session.getPhoneNumber());
        System.out.println("🌍 Country Code: " + session.getCountryCode());
        System.out.println("📅 Date of Birth: " + session.getDateOfBirth());
        System.out.println("🔒 Password Hash from session: " + session.getPasswordHash().substring(0, Math.min(20, session.getPasswordHash().length())) + "...");
        System.out.println("📊 Hash length: " + session.getPasswordHash().length() + " characters");
        
        User user = new User();
        user.setFullName(session.getFullName());
        user.setUsername(username);
        user.setEmail(session.getEmail());
        user.setPhoneNumber(session.getPhoneNumber());
        user.setCountryCode(session.getCountryCode());
        user.setDateOfBirth(session.getDateOfBirth());
        user.setPasswordHash(session.getPasswordHash());
        user.setIsEmailVerified(true);

        User savedUser = userRepository.save(user);
        
        System.out.println("✅ User saved to database:");
        System.out.println("   User ID: " + savedUser.getId());
        System.out.println("   Email: " + savedUser.getEmail());
        System.out.println("   Username: " + savedUser.getUsername());
        System.out.println("   Full Name: '" + savedUser.getFullName() + "'");
        System.out.println("   Full Name Length: " + (savedUser.getFullName() != null ? savedUser.getFullName().length() : "NULL") + " characters");
        System.out.println("   Phone: " + savedUser.getPhoneNumber());
        System.out.println("   Country Code: " + savedUser.getCountryCode());
        System.out.println("   Date of Birth: " + savedUser.getDateOfBirth());
        System.out.println("   Password Hash: " + savedUser.getPasswordHash().substring(0, Math.min(20, savedUser.getPasswordHash().length())) + "...");
        System.out.println("===========================================");

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());

        // Clean up session
        registrationSessionRepository.delete(session);

        System.out.println("🎉 REGISTRATION COMPLETED SUCCESSFULLY!");
        System.out.println("   👤 Username: " + user.getUsername());
        System.out.println("   📧 Email: " + user.getEmail());
        System.out.println("   📛 Full Name: '" + user.getFullName() + "'");
        System.out.println("   🆔 User ID: " + user.getId());

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(null);
        response.setCurrentStep("COMPLETED");
        response.setMessage("Registration completed successfully! Welcome to BharathVA!");
        return response;
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
        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(session.getEmail());
        emailOtp.setOtpCode(otp);
        emailOtp.setExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        emailOtp.setIsUsed(false);

        emailOtpRepository.save(emailOtp);
        emailService.sendOtpEmail(session.getEmail(), otp);

        System.out.println("OTP resent for session: " + session.getSessionToken());

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(session.getSessionToken());
        response.setCurrentStep("OTP");
        response.setMessage("New OTP sent to your email.");
        return response;
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
