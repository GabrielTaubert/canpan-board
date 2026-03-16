package de.uni.canpan.backend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MoveColumnRequestTest {

    @Test
    void testConstructor() {
        MoveColumnRequest request = new MoveColumnRequest(5);
        
        assertEquals(5, request.position());
    }

    @Test
    void testWithNullPosition() {
        MoveColumnRequest request = new MoveColumnRequest(null);
        
        assertNull(request.position());
    }
}
