package de.uni.canpan.backend.dto;

public record ColumnStatsDto(
        String columnName,
        int taskCount,
        long storyPointsSum
) {}