package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.TaskLabel;

import java.util.UUID;

public record TaskLabelDto(UUID id, String labelText, String color) {
    public static TaskLabelDto from(TaskLabel label) {
        if (label == null) return null;
        return new TaskLabelDto(label.getId(), label.getLabelText(), label.getColor());
    }
}