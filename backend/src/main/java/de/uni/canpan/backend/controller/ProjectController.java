package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.CreateProjectRequest;
import de.uni.canpan.backend.dto.ProjectDto;
import de.uni.canpan.backend.dto.UpdateProjectNameRequest;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.security.UserPrincipal;
import de.uni.canpan.backend.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectDto> getProjects(@AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = UUID.fromString(principal.getUserId());
        return projectService.getProjectsForUser(userId).stream()
                .map(p -> ProjectDto.from(p, userId))
                .toList();
    }

    @PostMapping
    public ProjectDto createProject(
            @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = UUID.fromString(principal.getUserId());
        Project project = projectService.createProject(request.name(), userId);
        return ProjectDto.from(project, userId);
    }

    @PatchMapping("/{id}")
    public ProjectDto updateProjectName(
            @PathVariable UUID id,
            @RequestBody UpdateProjectNameRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = UUID.fromString(principal.getUserId());
        Project project = projectService.updateProjectName(id, request.name(), userId);
        return ProjectDto.from(project, userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID userId = UUID.fromString(principal.getUserId());
        projectService.deleteProject(id, userId);
        return ResponseEntity.noContent().build();
    }
}
