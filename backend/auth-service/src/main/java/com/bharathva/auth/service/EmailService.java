package com.bharathva.auth.service;

import com.bharathva.shared.exception.BusinessException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("BharathVA - Your Email Verification Code");

            String htmlContent = buildOtpEmailTemplate(otp);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("OTP email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new BusinessException("Failed to send verification email. Please try again.");
        }
    }

    private String buildOtpEmailTemplate(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .otp-box {
                        background: white;
                        padding: 20px;
                        margin: 20px 0;
                        text-align: center;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .otp-code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #667eea;
                        letter-spacing: 8px;
                        margin: 10px 0;
                    }
                    .india-colors {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin: 20px 0;
                    }
                    .india-colors div {
                        width: 30px;
                        height: 5px;
                        border-radius: 3px;
                    }
                    .orange { background: #FF9933; }
                    .white { background: #FFFFFF; border: 1px solid #ddd; }
                    .green { background: #138808; }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        color: #777;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🇮🇳 BharathVA</h1>
                    <p>Your Voice, Our Nation</p>
                </div>
                <div class="content">
                    <h2>Verify Your Email Address</h2>
                    <p>Thank you for joining BharathVA! To complete your registration, please use the verification code below:</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; color: #666;">Your Verification Code</p>
                        <div class="otp-code">%s</div>
                        <p style="margin: 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
                    </div>
                    
                    <div class="india-colors">
                        <div class="orange"></div>
                        <div class="white"></div>
                        <div class="green"></div>
                    </div>
                    
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This code will expire in 10 minutes</li>
                        <li>Never share this code with anyone</li>
                        <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                    
                    <p>Welcome to the BharathVA community!</p>
                    <p><em>Jai Hind! 🇮🇳</em></p>
                </div>
                <div class="footer">
                    <p>© 2024 BharathVA. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </body>
            </html>
            """.formatted(otp);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to BharathVA, " + username + "!");

            String htmlContent = buildWelcomeEmailTemplate(username);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Welcome email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
            // Don't throw exception for welcome email failure
        }
    }

    private String buildWelcomeEmailTemplate(String username) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #FF9933 0%, #138808 100%);
                        color: white;
                        padding: 40px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .cta-button {
                        display: inline-block;
                        background: #667eea;
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        color: #777;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Welcome to BharathVA!</h1>
                    <p>Your journey begins now, @%s</p>
                </div>
                <div class="content">
                    <h2>Namaste! 🙏</h2>
                    <p>We're thrilled to have you join our community of passionate voices!</p>
                    
                    <p>BharathVA is your platform to:</p>
                    <ul>
                        <li>🗣️ Share your voice and perspectives</li>
                        <li>🤝 Connect with like-minded individuals</li>
                        <li>🇮🇳 Celebrate our incredible nation</li>
                        <li>📱 Stay updated with what matters</li>
                    </ul>
                    
                    <p>Your registration is complete, and you're all set to explore!</p>
                    
                    <p><strong>Jai Hind! 🇮🇳</strong></p>
                </div>
                <div class="footer">
                    <p>© 2024 BharathVA. All rights reserved.</p>
                </div>
            </body>
            </html>
            """.formatted(username);
    }
}

