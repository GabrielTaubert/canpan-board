package de.uni.canpan.backend.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RenameColumnRequestTest {

    @Test
    void testConstructor() {
        RenameColumnRequest request = new RenameColumnRequest("New Name");
        
        assertEquals("New Name", request.name());
    }

    @Test
    void testWithNullName() {
        RenameColumnRequest request = new RenameColumnRequest(null);
        
        assertNull(request.name());
    }
}
