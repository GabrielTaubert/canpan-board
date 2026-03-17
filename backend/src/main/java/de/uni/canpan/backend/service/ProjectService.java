package de.uni.canpan.backend.service;

import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
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
    private final KanbanColumnRepository kanbanColumnRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, KanbanColumnRepository kanbanColumnRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.kanbanColumnRepository = kanbanColumnRepository;
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsForUser(UUID userId) {
        return projectRepository.findByMembersId(userId);
    }

    @Transactional
    public Project createProject(String name, UUID creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Project project = new Project(name);
        project.getMembers().add(creator);
        Project saved = projectRepository.save(project);
        kanbanColumnRepository.save(new KanbanColumn(saved, "TODO", 0));
        kanbanColumnRepository.save(new KanbanColumn(saved, "Done", 1));
        return saved;
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID requestingUserId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        boolean isMember = project.getMembers().stream()
                .anyMatch(user -> user.getId().equals(requestingUserId));
        if (!isMember) {
            throw new IllegalArgumentException("User is not a member of this project");
        }
        projectRepository.delete(project);
    }
}
