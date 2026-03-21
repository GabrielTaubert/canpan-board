package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.Task;

import java.util.UUID;

public record TaskSummaryDto(
        UUID id,
        String title,
        Task.TaskPriority priority,
        Integer storypoints,
        UUID assignedTo,
        UUID columnId
) {
    public static TaskSummaryDto from(Task task) {
        UUID assignedUserId = (task.getAssignedTo() != null) ? task.getAssignedTo().getId() : null;
        return new TaskSummaryDto(
                task.getId(),
                task.getTitle(),
                task.getPriority(),
                task.getStorypoints(),
                assignedUserId,
                task.getColumn().getId()
        );
    }
}
