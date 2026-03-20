package de.uni.canpan.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AddMemberRequest(@NotBlank String email) {}
