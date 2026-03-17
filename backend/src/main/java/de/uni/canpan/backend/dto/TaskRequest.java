package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.Task;

import java.util.UUID;

public record TaskRequest(
        String title,
        String description,
        Task.TaskPriority priority,
        Integer storypoints,
        UUID assignedTo,
        UUID columnId // optional for edit
) {}
