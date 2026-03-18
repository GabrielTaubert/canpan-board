package de.uni.canpan.backend.dto;

import java.util.UUID;

public record TaskCommentRequest(
        String content,
        UUID userId
) {}