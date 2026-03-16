package de.uni.canpan.backend.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthExceptionTest {

    @Test
    void constructor_withMessage_setsMessage() {
        AuthException exception = new AuthException("Test error");

        assertEquals("Test error", exception.getMessage());
        assertEquals("Test error", exception.getError());
    }

    @Test
    void constructor_withMessageAndError_setsBoth() {
        AuthException exception = new AuthException("Test message", "Test error");

        assertEquals("Test message", exception.getMessage());
        assertEquals("Test error", exception.getError());
    }
}
