package de.uni.canpan.backend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CreateColumnRequestTest {

    @Test
    void testConstructor() {
        CreateColumnRequest request = new CreateColumnRequest("To Do", 0);
        
        assertEquals("To Do", request.name());
        assertEquals(0, request.position());
    }

    @Test
    void testWithNullValues() {
        CreateColumnRequest request = new CreateColumnRequest(null, null);
        
        assertNull(request.name());
        assertNull(request.position());
    }

    @Test
    void testAllFields() {
        CreateColumnRequest request = new CreateColumnRequest("Done", 3);
        
        assertEquals("Done", request.name());
        assertEquals(3, request.position());
    }
}
