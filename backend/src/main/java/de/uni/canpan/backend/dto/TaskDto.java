package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Task;

import java.util.UUID;

public record TaskDto(
        UUID id,
        String title,
        String description,
        Task.TaskPriority priority,
        Integer storypoints,
        UUID assignedTo
) {
    public static TaskDto from(Task task) {
        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStorypoints(),
                task.getAssignedTo()
        );
    }
}