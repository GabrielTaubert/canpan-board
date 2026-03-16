package de.uni.canpan.backend.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserPrincipalTest {

    @Test
    void constructor_setsValues() {
        UserPrincipal principal = new UserPrincipal("user-id", "test@example.com");

        assertEquals("user-id", principal.getUserId());
        assertEquals("test@example.com", principal.getEmail());
        assertEquals("user-id", principal.getName());
    }

    @Test
    void getName_returnsUserId() {
        UserPrincipal principal = new UserPrincipal("user-id", "test@example.com");

        assertEquals("user-id", principal.getName());
    }

    @Test
    void getEmail_withNullEmail_returnsNull() {
        UserPrincipal principal = new UserPrincipal("user-id", null);

        assertNull(principal.getEmail());
    }
}
