package de.uni.canpan.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import de.uni.canpan.backend.model.KanbanColumn;

import java.util.UUID;

public record KanbanColumnDto(
        UUID id,
        String name,
        int position,
        @JsonProperty("isSystem")
        boolean isSystem
) {
    public static KanbanColumnDto from(KanbanColumn column) {
        return new KanbanColumnDto(
                column.getId(),
                column.getName(),
                column.getPosition(),
                column.isSystem()
        );
    }
}