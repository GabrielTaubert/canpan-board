package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.Task;

import java.util.UUID;

public record TaskSummaryDto(
        UUID id,
        String title,
        String description,
        Task.TaskPriority priority,
        String assignedTo,
        UUID columnId
) {
    public static TaskSummaryDto from(Task task) {
        String userName = (task.getAssignedTo() != null)
                ? task.getAssignedTo().getDisplayName()
                : null;

        return new TaskSummaryDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                userName,
                task.getColumn().getId()
        );
    }
}
