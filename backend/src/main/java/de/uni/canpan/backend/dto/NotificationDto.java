package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.Notification;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationDto(
        UUID id,
        String message,
        OffsetDateTime createdAt
) {
    public static NotificationDto from(Notification n) {
        return new NotificationDto(n.getId(), n.getMessage(), n.getCreatedAt());
    }
}