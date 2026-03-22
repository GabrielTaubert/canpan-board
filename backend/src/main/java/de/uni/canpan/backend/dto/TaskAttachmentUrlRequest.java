package de.uni.canpan.backend.dto;

public record TaskAttachmentUrlRequest(
        String fileName,
        String fileUrl
) {}