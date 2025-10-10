package com.bharathva.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("BharathVA - Your Email Verification Code");
            
            String body = "Namaste!\n\n" +
                    "Thank you for joining BharathVA - Your Voice, Our Nation!\n\n" +
                    "Your 6-digit verification code is:\n\n" +
                    otp + "\n\n" +
                    "This code will expire in 10 minutes.\n\n" +
                    "Important:\n" +
                    "- Never share this code with anyone\n" +
                    "- If you didn't request this code, please ignore this email\n\n" +
                    "Welcome to the BharathVA community!\n\n" +
                    "Jai Hind!\n\n" +
                    "—\n" +
                    "Team BharathVA\n" +
                    "© 2024 BharathVA. All rights reserved.";
            
            message.setText(body);
            mailSender.send(message);
            
            System.out.println("✅ OTP email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email to: " + toEmail + " - " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to BharathVA, @" + username + "!");
            
            String body = "Namaste!\n\n" +
                    "Welcome to BharathVA - Your Voice, Our Nation!\n\n" +
                    "Hi @" + username + ",\n\n" +
                    "We're thrilled to have you join our community of passionate voices!\n\n" +
                    "BharathVA is your platform to:\n" +
                    "• Share your voice and perspectives\n" +
                    "• Connect with like-minded individuals\n" +
                    "• Celebrate our incredible nation\n" +
                    "• Stay updated with what matters\n\n" +
                    "Your registration is complete, and you're all set to explore!\n\n" +
                    "Jai Hind!\n\n" +
                    "—\n" +
                    "Team BharathVA\n" +
                    "© 2024 BharathVA. All rights reserved.";
            
            message.setText(body);
            mailSender.send(message);
            
            System.out.println("✅ Welcome email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send welcome email to: " + toEmail + " - " + e.getMessage());
        }
    }
}

