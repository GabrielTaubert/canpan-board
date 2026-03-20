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
import org.springframework.security.core.context.SecurityContextHolder;
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
class MemberControllerTest extends AbstractPostgresIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean  private JwtService jwtService;

    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private KanbanColumnRepository kanbanColumnRepository;

    private UUID ownerId;
    private UUID memberId;
    private UUID outsiderId;
    private Project project;
    private User owner;
    private User member;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        taskRepository.deleteAll();
        kanbanColumnRepository.deleteAll();
        projectMemberRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();

        ownerId    = UUID.randomUUID();
        memberId   = UUID.randomUUID();
        outsiderId = UUID.randomUUID();
        owner  = userRepository.save(new User(ownerId,    "owner@example.com"));
        member = userRepository.save(new User(memberId,   "member@example.com"));
        userRepository.save(new User(outsiderId, "outsider@example.com"));

        project = projectRepository.save(new Project("Test Project"));
        projectMemberRepository.save(new ProjectMember(project, owner, MemberRole.OWNER));
        projectMemberRepository.save(new ProjectMember(project, member, MemberRole.MEMBER));

        when(jwtService.extractUserIdFromToken("owner-token")).thenReturn(Optional.of(ownerId.toString()));
        when(jwtService.extractEmailFromToken("owner-token")).thenReturn(Optional.of("owner@example.com"));

        when(jwtService.extractUserIdFromToken("member-token")).thenReturn(Optional.of(memberId.toString()));
        when(jwtService.extractEmailFromToken("member-token")).thenReturn(Optional.of("member@example.com"));

        when(jwtService.extractUserIdFromToken("outsider-token")).thenReturn(Optional.of(outsiderId.toString()));
        when(jwtService.extractEmailFromToken("outsider-token")).thenReturn(Optional.of("outsider@example.com"));
    }

    // --- GET /members ---

    @Test
    void getMembers_returns200WithAllMembers() throws Exception {
        mockMvc.perform(get("/api/projects/" + project.getId() + "/members")
                .header("Authorization", "Bearer owner-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getMembers_returns403_whenCalledByNonMember() throws Exception {
        mockMvc.perform(get("/api/projects/" + project.getId() + "/members")
                .header("Authorization", "Bearer outsider-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getMembers_returns403_whenNoToken() throws Exception {
        mockMvc.perform(get("/api/projects/" + project.getId() + "/members"))
                .andExpect(status().isForbidden());
    }

    // --- POST /members ---

    @Test
    void addMember_returns200WithNewMember_whenCalledByOwner() throws Exception {
        User newUser = userRepository.save(new User(UUID.randomUUID(), "new@example.com"));

        mockMvc.perform(post("/api/projects/" + project.getId() + "/members")
                .header("Authorization", "Bearer owner-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", newUser.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@example.com"))
                .andExpect(jsonPath("$.role").value("MEMBER"));
    }

    @Test
    void addMember_returns403_whenCalledByNonOwner() throws Exception {
        User newUser = userRepository.save(new User(UUID.randomUUID(), "new2@example.com"));

        mockMvc.perform(post("/api/projects/" + project.getId() + "/members")
                .header("Authorization", "Bearer member-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", newUser.getEmail()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void addMember_returns400_whenEmailIsBlank() throws Exception {
        mockMvc.perform(post("/api/projects/" + project.getId() + "/members")
                .header("Authorization", "Bearer owner-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", ""))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addMember_returns400_whenAlreadyMember() throws Exception {
        mockMvc.perform(post("/api/projects/" + project.getId() + "/members")
                .header("Authorization", "Bearer owner-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("email", member.getEmail()))))
                .andExpect(status().isBadRequest());
    }

    // --- DELETE /members/{userId} ---

    @Test
    void removeMember_returns204_whenCalledByOwner() throws Exception {
        mockMvc.perform(delete("/api/projects/" + project.getId() + "/members/" + memberId)
                .header("Authorization", "Bearer owner-token"))
                .andExpect(status().isNoContent());
    }

    @Test
    void removeMember_returns403_whenCalledByNonOwner() throws Exception {
        mockMvc.perform(delete("/api/projects/" + project.getId() + "/members/" + ownerId)
                .header("Authorization", "Bearer member-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void removeMember_returns400_whenRemovingLastOwner() throws Exception {
        mockMvc.perform(delete("/api/projects/" + project.getId() + "/members/" + ownerId)
                .header("Authorization", "Bearer owner-token"))
                .andExpect(status().isBadRequest());
    }

    // --- PUT /members/{userId}/role ---

    @Test
    void updateRole_returns200WithUpdatedRole_whenCalledByOwner() throws Exception {
        mockMvc.perform(put("/api/projects/" + project.getId() + "/members/" + memberId + "/role")
                .header("Authorization", "Bearer owner-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("role", "OWNER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("OWNER"));
    }

    @Test
    void updateRole_returns400_whenDemotingLastOwner() throws Exception {
        mockMvc.perform(put("/api/projects/" + project.getId() + "/members/" + ownerId + "/role")
                .header("Authorization", "Bearer owner-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("role", "MEMBER"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateRole_returns400_whenRoleIsMissing() throws Exception {
        mockMvc.perform(put("/api/projects/" + project.getId() + "/members/" + memberId + "/role")
                .header("Authorization", "Bearer owner-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateRole_returns403_whenCalledByNonOwner() throws Exception {
        mockMvc.perform(put("/api/projects/" + project.getId() + "/members/" + memberId + "/role")
                .header("Authorization", "Bearer member-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("role", "OWNER"))))
                .andExpect(status().isForbidden());
    }
}
