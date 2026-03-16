package de.uni.canpan.backend.dto;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class KanbanColumnDtoTest {

    @Test
    void testConstructor() {
        UUID id = UUID.randomUUID();
        KanbanColumnDto dto = new KanbanColumnDto(id, "To Do", 1);

        assertEquals(id, dto.id());
        assertEquals("To Do", dto.name());
        assertEquals(1, dto.position());
    }

    @Test
    void testAllFields() {
        UUID id = UUID.randomUUID();
        KanbanColumnDto dto = new KanbanColumnDto(id, "In Progress", 2);

        assertNotNull(dto);
        assertEquals(id, dto.id());
        assertEquals("In Progress", dto.name());
        assertEquals(2, dto.position());
    }
}
