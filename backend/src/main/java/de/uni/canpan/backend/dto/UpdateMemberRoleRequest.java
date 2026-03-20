package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.MemberRole;
import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleRequest(@NotNull MemberRole role) {}
