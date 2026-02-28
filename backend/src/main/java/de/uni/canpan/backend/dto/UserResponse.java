package de.uni.canpan.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserResponse {

    private UUID id;
    private String email;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(UUID id, String email, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
