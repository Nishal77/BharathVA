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

    @Transactional
    public RegistrationResponse registerEmail(RegisterEmailRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("Email is already registered. Please login instead.");
        }

        registrationSessionRepository.findByEmail(email)
                .ifPresent(session -> {
                    emailOtpRepository.deleteByEmail(email);
                    registrationSessionRepository.delete(session);
                });

        String sessionToken = UUID.randomUUID().toString();
        RegistrationSession session = new RegistrationSession();
        session.setSessionToken(sessionToken);
        session.setEmail(email);
        session.setCurrentStep("EMAIL");
        session.setIsEmailVerified(false);
        session.setExpiry(LocalDateTime.now().plusHours(24));

        registrationSessionRepository.save(session);

        String otp = OTPGenerator.generateSixDigitOTP();
        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtpCode(otp);
        emailOtp.setExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        emailOtp.setIsUsed(false);

        emailOtpRepository.save(emailOtp);
        emailService.sendOtpEmail(email, otp);

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(sessionToken);
        response.setCurrentStep("OTP");
        response.setEmail(email);
        response.setMessage("OTP sent to your email. Please verify.");
        return response;
    }

    @Transactional
    public RegistrationResponse saveUserDetails(RegisterDetailsRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("OTP")) {
            throw new BusinessException("Invalid registration step. Please verify OTP first.");
        }

        if (!session.getIsEmailVerified()) {
            throw new BusinessException("Please verify your email with OTP first.");
        }

        session.setFullName(request.getFullName().trim());
        session.setPhoneNumber(request.getPhoneNumber().trim());
        session.setCountryCode(request.getCountryCode());
        session.setDateOfBirth(request.getDateOfBirth());
        session.setCurrentStep("DETAILS");

        registrationSessionRepository.save(session);

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(session.getSessionToken());
        response.setCurrentStep("PASSWORD");
        response.setMessage("Details saved. Please create a password.");
        return response;
    }

    @Transactional
    public RegistrationResponse verifyOtp(VerifyOtpRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("EMAIL")) {
            throw new BusinessException("Invalid registration step.");
        }

        EmailOtp emailOtp = emailOtpRepository
                .findByEmailAndOtpCodeAndIsUsedFalseAndExpiryAfter(
                        session.getEmail(),
                        request.getOtp(),
                        LocalDateTime.now()
                )
                .orElseThrow(() -> new BusinessException("Invalid or expired OTP"));

        emailOtp.setIsUsed(true);
        emailOtpRepository.save(emailOtp);

        session.setIsEmailVerified(true);
        session.setCurrentStep("OTP");
        registrationSessionRepository.save(session);

        emailOtpRepository.deleteByEmail(session.getEmail());

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(session.getSessionToken());
        response.setCurrentStep("DETAILS");
        response.setMessage("Email verified successfully. Please provide your details.");
        return response;
    }

    @Transactional
    public RegistrationResponse createPassword(CreatePasswordRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("DETAILS")) {
            throw new BusinessException("Invalid registration step. Please provide details first.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Passwords do not match");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        session.setPasswordHash(hashedPassword);
        session.setCurrentStep("PASSWORD");

        registrationSessionRepository.save(session);

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(session.getSessionToken());
        response.setCurrentStep("USERNAME");
        response.setMessage("Password created. Please choose a username.");
        return response;
    }

    @Transactional
    public RegistrationResponse createUsername(CreateUsernameRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("PASSWORD")) {
            throw new BusinessException("Invalid registration step. Please create password first.");
        }

        String username = request.getUsername().toLowerCase().trim();

        if (userRepository.existsByUsername(username)) {
            throw new BusinessException("Username is already taken. Please choose another.");
        }

        User user = new User();
        user.setFullName(session.getFullName());
        user.setUsername(username);
        user.setEmail(session.getEmail());
        user.setPhoneNumber(session.getPhoneNumber());
        user.setCountryCode(session.getCountryCode());
        user.setDateOfBirth(session.getDateOfBirth());
        user.setPasswordHash(session.getPasswordHash());
        user.setIsEmailVerified(true);

        userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        registrationSessionRepository.delete(session);

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(null);
        response.setCurrentStep("COMPLETED");
        response.setMessage("Registration completed successfully! Welcome to BharathVA!");
        return response;
    }

    @Transactional
    public RegistrationResponse resendOtp(ResendOtpRequest request) {
        RegistrationSession session = getValidSession(request.getSessionToken());

        if (!session.getCurrentStep().equals("EMAIL")) {
            throw new BusinessException("OTP can only be resent during email verification step.");
        }

        emailOtpRepository.deleteByEmail(session.getEmail());

        String otp = OTPGenerator.generateSixDigitOTP();
        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(session.getEmail());
        emailOtp.setOtpCode(otp);
        emailOtp.setExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        emailOtp.setIsUsed(false);

        emailOtpRepository.save(emailOtp);
        emailService.sendOtpEmail(session.getEmail(), otp);

        RegistrationResponse response = new RegistrationResponse();
        response.setSessionToken(session.getSessionToken());
        response.setCurrentStep("OTP");
        response.setMessage("New OTP sent to your email.");
        return response;
    }

    public boolean checkUsernameAvailability(String username) {
        return !userRepository.existsByUsername(username.toLowerCase().trim());
    }

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
