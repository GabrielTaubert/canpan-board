package de.uni.canpan.backend.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void constructor_withMessage_setsMessage() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Not found");

        assertEquals("Not found", exception.getMessage());
    }

    @Test
    void constructor_withResourceFieldValue_setsFormattedMessage() {
        ResourceNotFoundException exception = new ResourceNotFoundException("User", "id", "123");

        assertEquals("User not found with id: '123'", exception.getMessage());
    }
}
