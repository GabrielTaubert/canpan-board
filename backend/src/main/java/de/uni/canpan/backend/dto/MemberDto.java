package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.MemberRole;
import de.uni.canpan.backend.model.ProjectMember;

import java.util.UUID;

public record MemberDto(UUID userId, String email, MemberRole role) {
    public static MemberDto from(ProjectMember member) {
        return new MemberDto(
                member.getUser().getId(),
                member.getUser().getEmail(),
                member.getRole()
        );
    }
}
