package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.Task;

import java.time.OffsetDateTime;
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
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<TaskAttachmentDto> attachments
) {}