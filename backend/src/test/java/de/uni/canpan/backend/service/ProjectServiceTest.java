package de.uni.canpan.backend.service;

import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.model.MemberRole;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectMemberRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import de.uni.canpan.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ProjectServiceTest extends AbstractPostgresIntegrationTest {

    @Autowired private ProjectService projectService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private KanbanColumnRepository kanbanColumnRepository;

    private User user;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        kanbanColumnRepository.deleteAll();
        projectMemberRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        user = userRepository.save(new User(UUID.randomUUID(), "creator@example.com"));
    }

    @Test
    void createProject_savesProjectWithCorrectName() {
        Project project = projectService.createProject("My Project", user.getId());

        assertThat(project.getId()).isNotNull();
        assertThat(project.getName()).isEqualTo("My Project");
        assertThat(projectRepository.findById(project.getId())).isPresent();
    }

    @Test
    void createProject_createsCreatorAsOwnerMember() {
        Project project = projectService.createProject("My Project", user.getId());

        var member = projectMemberRepository.findByProjectIdAndUserId(project.getId(), user.getId());
        assertThat(member).isPresent();
        assertThat(member.get().getRole()).isEqualTo(MemberRole.OWNER);
    }

    @Test
    void createProject_throwsException_whenUserNotFound() {
        assertThatThrownBy(() -> projectService.createProject("Project", UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getProjectsForUser_returnsOnlyUserProjects() {
        projectService.createProject("Project A", user.getId());
        projectService.createProject("Project B", user.getId());
        User other = userRepository.save(new User(UUID.randomUUID(), "other@example.com"));
        projectService.createProject("Other Project", other.getId());

        List<Project> projects = projectService.getProjectsForUser(user.getId());

        assertThat(projects).hasSize(2);
        assertThat(projects).extracting(Project::getName)
                .containsExactlyInAnyOrder("Project A", "Project B");
    }

    @Test
    void getProjectsForUser_returnsEmptyList_whenUserHasNoProjects() {
        List<Project> projects = projectService.getProjectsForUser(user.getId());
        assertThat(projects).isEmpty();
    }

    @Test
    void deleteProject_removesProject_whenUserIsMember() {
        Project project = projectService.createProject("To Delete", user.getId());

        projectService.deleteProject(project.getId(), user.getId());

        assertThat(projectRepository.findById(project.getId())).isEmpty();
    }

    @Test
    void deleteProject_throwsException_whenProjectNotFound() {
        assertThatThrownBy(() -> projectService.deleteProject(UUID.randomUUID(), user.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Project not found");
    }

    @Test
    void deleteProject_throwsException_whenUserIsNotMember() {
        Project project = projectService.createProject("My Project", user.getId());
        User nonMember = userRepository.save(new User(UUID.randomUUID(), "nonmember@example.com"));

        assertThatThrownBy(() -> projectService.deleteProject(project.getId(), nonMember.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not a member");
    }
}
