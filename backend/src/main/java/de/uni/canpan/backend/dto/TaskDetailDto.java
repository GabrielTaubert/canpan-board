package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.Task;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

public record TaskDetailDto(
        UUID id,
        String title,
        String description,
        UUID columnId,
        String columnName,
        Task.TaskPriority priority,
        Integer storypoints,
        UUID assignedTo,
        Timestamp createdAt,
        Timestamp updatedAt,
        List<TaskAttachmentDto> attachments
) {}