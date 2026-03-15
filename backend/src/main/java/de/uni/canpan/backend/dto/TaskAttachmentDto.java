package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.TaskAttachment;
import java.util.UUID;

public record TaskAttachmentDto(
        UUID id,
        String fileName,
        String fileUrl
) {

    public static TaskAttachmentDto from(TaskAttachment attachment) {
        return new TaskAttachmentDto(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFilePath()
        );
    }
}