package de.uni.canpan.backend.dto;

public record TaskLabelRequest(
        String labelText,
        String color
) {}
