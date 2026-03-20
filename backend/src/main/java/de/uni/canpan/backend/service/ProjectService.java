package de.uni.canpan.backend.service;

import de.uni.canpan.backend.model.MemberRole;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.model.ProjectMember;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.ProjectMemberRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final KanbanColumnService kanbanColumnService;
    private final ProjectMemberRepository projectMemberRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository,
                          KanbanColumnService kanbanColumnService, ProjectMemberRepository projectMemberRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.kanbanColumnService = kanbanColumnService;
        this.projectMemberRepository = projectMemberRepository;
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsForUser(UUID userId) {
        return projectRepository.findByProjectMembersUserId(userId);
    }

    @Transactional
    public Project createProject(String name, UUID creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Project project = new Project(name);
        Project saved = projectRepository.save(project);
        ProjectMember ownerMember = new ProjectMember(saved, creator, MemberRole.OWNER);
        projectMemberRepository.save(ownerMember);
        kanbanColumnService.initializeProject(saved);
        return saved;
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID requestingUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, requestingUserId);
        if (!isMember) {
            throw new IllegalArgumentException("User is not a member of this project");
        }
        projectRepository.delete(project);
    }
}
