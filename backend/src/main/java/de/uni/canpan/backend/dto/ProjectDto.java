package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.MemberRole;
import de.uni.canpan.backend.model.Project;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProjectDto(
        UUID id,
        String name,
        List<String> members,
        Instant updatedAt,
        boolean isOwner
) {
    public static ProjectDto from(Project project, UUID requestingUserId) {
        List<String> memberEmails = project.getMembers().stream()
                .map(user -> user.getEmail())
                .toList();
        boolean isOwner = project.getProjectMembers().stream()
                .anyMatch(pm -> pm.getUser().getId().equals(requestingUserId)
                        && pm.getRole() == MemberRole.OWNER);
        return new ProjectDto(project.getId(), project.getName(), memberEmails, project.getUpdatedAt(), isOwner);
    }
}
