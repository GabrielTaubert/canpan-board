package de.uni.canpan.backend.dto;

public record DashboardProgressDto(
        int progress,      // 0 bis 100
        String status,     // "RUNNING" oder "COMPLETED"
        Object result      // Die fertigen Stats (wenn fertig)
) {}
