package de.uni.canpan.backend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthResponseTest {

    @Test
    void constructor_withValidParams_createsObject() {
        AuthResponse response = new AuthResponse("token123", "bearer", 3600, "refresh", "user-id", "test@example.com");

        assertEquals("token123", response.getAccessToken());
        assertEquals("bearer", response.getTokenType());
        assertEquals(3600, response.getExpiresIn());
        assertEquals("refresh", response.getRefreshToken());
        assertEquals("user-id", response.getUserId());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void setters_setValues() {
        AuthResponse response = new AuthResponse();
        response.setAccessToken("token");
        response.setTokenType("bearer");
        response.setExpiresIn(7200);
        response.setRefreshToken("refresh");
        response.setUserId("user123");
        response.setEmail("email@test.com");

        assertEquals("token", response.getAccessToken());
        assertEquals("bearer", response.getTokenType());
        assertEquals(7200, response.getExpiresIn());
        assertEquals("refresh", response.getRefreshToken());
        assertEquals("user123", response.getUserId());
        assertEquals("email@test.com", response.getEmail());
    }
}
