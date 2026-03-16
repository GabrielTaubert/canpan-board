package de.uni.canpan.backend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LoginRequestTest {

    @Test
    void constructor_withValidParams_createsObject() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");

        assertEquals("test@example.com", request.getEmail());
        assertEquals("password123", request.getPassword());
    }

    @Test
    void setterEmail_setsEmail() {
        LoginRequest request = new LoginRequest();
        request.setEmail("new@example.com");

        assertEquals("new@example.com", request.getEmail());
    }

    @Test
    void setterPassword_setsPassword() {
        LoginRequest request = new LoginRequest();
        request.setPassword("newpass");

        assertEquals("newpass", request.getPassword());
    }
}
