package de.uni.canpan.backend.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserResponseTest {

    @Test
    void constructor_withValidParams_createsObject() {
        UUID id = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        UserResponse response = new UserResponse(id, "test@example.com", now);

        assertEquals(id, response.getId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals(now, response.getCreatedAt());
    }

    @Test
    void setters_setValues() {
        UserResponse response = new UserResponse();
        UUID id = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        response.setId(id);
        response.setEmail("email@test.com");
        response.setCreatedAt(now);

        assertEquals(id, response.getId());
        assertEquals("email@test.com", response.getEmail());
        assertEquals(now, response.getCreatedAt());
    }
}
