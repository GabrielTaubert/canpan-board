package de.uni.canpan.backend.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void constructor_setsValues() {
        UUID id = UUID.randomUUID();
        User user = new User(id, "test@example.com");

        assertEquals(id, user.getId());
        assertEquals("test@example.com", user.getEmail());
        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void setters_setValues() {
        User user = new User();
        UUID id = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        user.setId(id);
        user.setEmail("new@example.com");
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        assertEquals(id, user.getId());
        assertEquals("new@example.com", user.getEmail());
        assertEquals(now, user.getCreatedAt());
        assertEquals(now, user.getUpdatedAt());
    }
}
