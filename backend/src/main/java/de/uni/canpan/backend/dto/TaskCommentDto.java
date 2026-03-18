package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.TaskComment;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TaskCommentDto(
        UUID id,
        UUID userId,
        String content,
        OffsetDateTime createdAt
) {
    public static TaskCommentDto from(TaskComment comment) {
        return new TaskCommentDto(
                comment.getId(),
                comment.getUserId(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}