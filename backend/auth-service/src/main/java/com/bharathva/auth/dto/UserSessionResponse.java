package com.bharathva.auth.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserSessionResponse {
    
    private UUID id;
    private String deviceInfo;
    private String ipAddress;
    private LocalDateTime lastUsedAt;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean isCurrentSession;

    public UserSessionResponse() {}

    public UserSessionResponse(UUID id, String deviceInfo, String ipAddress, 
                              LocalDateTime lastUsedAt, LocalDateTime createdAt, 
                              LocalDateTime expiresAt, boolean isCurrentSession) {
        this.id = id;
        this.deviceInfo = deviceInfo;
        this.ipAddress = ipAddress;
        this.lastUsedAt = lastUsedAt;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.isCurrentSession = isCurrentSession;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isCurrentSession() {
        return isCurrentSession;
    }

    public void setCurrentSession(boolean currentSession) {
        isCurrentSession = currentSession;
    }
}

