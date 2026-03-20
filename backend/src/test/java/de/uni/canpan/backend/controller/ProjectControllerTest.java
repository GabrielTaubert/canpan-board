package de.uni.canpan.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
import de.uni.canpan.backend.model.MemberRole;
import de.uni.canpan.backend.model.Project;
import de.uni.canpan.backend.model.ProjectMember;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.ProjectMemberRepository;
import de.uni.canpan.backend.repository.ProjectRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import de.uni.canpan.backend.repository.UserRepository;
import de.uni.canpan.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProjectControllerTest extends AbstractPostgresIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean  private JwtService jwtService;

    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private KanbanColumnRepository kanbanColumnRepository;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        kanbanColumnRepository.deleteAll();
        projectMemberRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        userId = UUID.randomUUID();
        user = userRepository.save(new User(userId, "user@example.com"));

        when(jwtService.extractUserIdFromToken("test-token")).thenReturn(Optional.of(userId.toString()));
        when(jwtService.extractEmailFromToken("test-token")).thenReturn(Optional.of("user@example.com"));
    }

    @Test
    void getProjects_returns200WithProjects() throws Exception {
        Project project = projectRepository.save(new Project("Test Project"));
        projectMemberRepository.save(new ProjectMember(project, user, MemberRole.OWNER));

        mockMvc.perform(get("/api/projects")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Project"));
    }

    @Test
    void getProjects_returns403_whenNoToken() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getProjects_returnsEmptyList_whenUserHasNoProjects() throws Exception {
        mockMvc.perform(get("/api/projects")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void createProject_returns200WithNewProject() throws Exception {
        mockMvc.perform(post("/api/projects")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "New Project"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Project"))
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    void createProject_returns403_whenNoToken() throws Exception {
        mockMvc.perform(post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "New Project"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteProject_returns204_whenUserIsMember() throws Exception {
        Project project = projectRepository.save(new Project("To Delete"));
        projectMemberRepository.save(new ProjectMember(project, user, MemberRole.OWNER));

        mockMvc.perform(delete("/api/projects/" + project.getId())
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteProject_returns400_whenUserIsNotMember() throws Exception {
        User other = userRepository.save(new User(UUID.randomUUID(), "other@example.com"));
        Project project = projectRepository.save(new Project("Other's Project"));
        projectMemberRepository.save(new ProjectMember(project, other, MemberRole.OWNER));

        mockMvc.perform(delete("/api/projects/" + project.getId())
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteProject_returns400_whenProjectDoesNotExist() throws Exception {
        mockMvc.perform(delete("/api/projects/" + UUID.randomUUID())
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateProjectName_returns200_whenOwner() throws Exception {
        Project project = projectRepository.save(new Project("Old Name"));
        projectMemberRepository.save(new ProjectMember(project, user, MemberRole.OWNER));

        mockMvc.perform(patch("/api/projects/" + project.getId())
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "New Name"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    void updateProjectName_returns403_whenNonOwner() throws Exception {
        User ownerUser = userRepository.save(new User(UUID.randomUUID(), "owner2@example.com"));
        Project project = projectRepository.save(new Project("Shared Project"));
        projectMemberRepository.save(new ProjectMember(project, ownerUser, MemberRole.OWNER));
        projectMemberRepository.save(new ProjectMember(project, user, MemberRole.MEMBER));

        mockMvc.perform(patch("/api/projects/" + project.getId())
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "New Name"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateProjectName_returns403_whenNoToken() throws Exception {
        Project project = projectRepository.save(new Project("My Project"));
        projectMemberRepository.save(new ProjectMember(project, user, MemberRole.OWNER));

        mockMvc.perform(patch("/api/projects/" + project.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "New Name"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateProjectName_returns400_whenNameIsBlank() throws Exception {
        Project project = projectRepository.save(new Project("My Project"));
        projectMemberRepository.save(new ProjectMember(project, user, MemberRole.OWNER));

        mockMvc.perform(patch("/api/projects/" + project.getId())
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "   "))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getProjects_returnsIsOwnerTrue_whenUserIsOwner() throws Exception {
        Project project = projectRepository.save(new Project("Owner Project"));
        projectMemberRepository.save(new ProjectMember(project, user, MemberRole.OWNER));

        mockMvc.perform(get("/api/projects")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isOwner").value(true));
    }

    @Test
    void getProjects_returnsIsOwnerFalse_whenUserIsMember() throws Exception {
        User ownerUser = userRepository.save(new User(UUID.randomUUID(), "owner3@example.com"));
        Project project = projectRepository.save(new Project("Shared Project"));
        projectMemberRepository.save(new ProjectMember(project, ownerUser, MemberRole.OWNER));
        projectMemberRepository.save(new ProjectMember(project, user, MemberRole.MEMBER));

        mockMvc.perform(get("/api/projects")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isOwner").value(false));
    }
}
