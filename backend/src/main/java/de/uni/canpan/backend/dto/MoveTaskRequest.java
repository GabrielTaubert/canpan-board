package de.uni.canpan.backend.dto;

import java.util.UUID;

public record MoveTaskRequest (
        UUID columnId
) {}