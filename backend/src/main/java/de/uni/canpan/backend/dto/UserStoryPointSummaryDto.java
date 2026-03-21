package de.uni.canpan.backend.dto;

import java.util.UUID;

public record UserStoryPointSummaryDto(
        UUID userId,
        Long totalStoryPoints,
        Long openTasksCount
) {
    public static UserStoryPointSummaryDto fromRaw(Object[] result) {
        return new UserStoryPointSummaryDto(
                (UUID) result[0],    // assignedTo
                (Long) result[1],    // SUM(storypoints)
                (Long) result[2]     // COUNT(tasks)
        );
    }
}