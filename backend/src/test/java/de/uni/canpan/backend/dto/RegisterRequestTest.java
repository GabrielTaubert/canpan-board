package de.uni.canpan.backend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RegisterRequestTest {

    @Test
    void constructor_withValidParams_createsObject() {
        RegisterRequest request = new RegisterRequest("test@example.com", "password123");

        assertEquals("test@example.com", request.getEmail());
        assertEquals("password123", request.getPassword());
    }

    @Test
    void setterEmail_setsEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");

        assertEquals("new@example.com", request.getEmail());
    }

    @Test
    void setterPassword_setsPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setPassword("newpass");

        assertEquals("newpass", request.getPassword());
    }
}
