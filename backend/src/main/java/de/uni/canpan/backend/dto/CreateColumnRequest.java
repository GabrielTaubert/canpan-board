package de.uni.canpan.backend.dto;

public record CreateColumnRequest(
        String name,
        Integer position
) {}