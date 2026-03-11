package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.KanbanColumn;

import java.util.UUID;

public record KanbanColumnDto(
        UUID id,
        String name,
        int position
) {
    public static KanbanColumnDto from(KanbanColumn column) {
        return new KanbanColumnDto(
                column.getId(),
                column.getName(),
                column.getPosition()
        );
    }
}