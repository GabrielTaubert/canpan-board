package de.uni.canpan.backend.dto;

import de.uni.canpan.backend.model.Project;

import java.util.List;
import java.util.UUID;

public record ProjectDto(
        UUID id,
        String name,
        List<String> members
) {
    public static ProjectDto from(Project project) {
        List<String> memberEmails = project.getMembers().stream()
                .map(user -> user.getEmail())
                .toList();
        return new ProjectDto(project.getId(), project.getName(), memberEmails);
    }
}
