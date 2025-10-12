package com.bharathva.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
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
            message.setSubject("Verify your email for BharathVA");
            
            String body = "Namaste,\n\n" +
                    "Welcome to BharathVA - The Voice of India.\n\n" +
                    "You are joining India's own platform, built for the people of Bharat, by the people of Bharat. A space where your voice matters, your thoughts resonate, and your identity is celebrated.\n\n" +
                    "Your verification code is:\n\n" +
                    otp + "\n\n" +
                    "This code expires in 10 minutes for your security.\n\n" +
                    "If you did not request this code, you can safely ignore this email. Your account remains secure.\n\n" +
                    "We are proud to have you here.\n\n" +
                    "Jai Hind,\n" +
                    "The BharathVA Team\n\n" +
                    "---\n" +
                    "BharathVA - The Voice of India\n" +
                    "Built in India, for India";
            
            message.setText(body);
            mailSender.send(message);
            
            log.info("OTP email sent to: {}", toEmail);
            log.debug("OTP code: {}", otp);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to BharathVA, @" + username);
            
            String body = "Namaste, @" + username + "\n\n" +
                    "Your journey on BharathVA - The Voice of India begins now.\n\n" +
                    "You are now part of something truly special. This is not just another social platform. This is India's platform. A place where millions of voices come together to share ideas, spark conversations, and shape the future of our nation.\n\n" +
                    "Here, your thoughts have power. Your voice has reach. Your identity has pride.\n\n" +
                    "What you can do on BharathVA:\n\n" +
                    "- Share your perspectives with authenticity and confidence\n" +
                    "- Connect with passionate individuals who care about what matters\n" +
                    "- Engage in meaningful conversations that reflect our diverse culture\n" +
                    "- Stay informed with real voices, real stories, and real impact\n\n" +
                    "This is your platform. Built in India. For India.\n\n" +
                    "Welcome home.\n\n" +
                    "Jai Hind,\n" +
                    "The BharathVA Team\n\n" +
                    "---\n" +
                    "BharathVA - The Voice of India\n" +
                    "Built in India, for India";
            
            message.setText(body);
            mailSender.send(message);
            
            log.info("Welcome email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }
}

