package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.TaskComment;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TaskCommentDto(
        UUID id,
        UUID userId,
        String authorName,
        String content,
        OffsetDateTime createdAt
) {
    public static TaskCommentDto from(TaskComment comment) {

        String name = comment.getUser().getDisplayName();

        if (name == null || name.isBlank()) {
            name = comment.getUser().getEmail();
        }

        return new TaskCommentDto(
                comment.getId(),
                comment.getUser().getId(),
                name,
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}