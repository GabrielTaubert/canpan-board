package de.uni.canpan.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.uni.canpan.backend.AbstractPostgresIntegrationTest;
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
class AuthControllerTest extends AbstractPostgresIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean  private JwtService jwtService;

    @Autowired private UserRepository userRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private KanbanColumnRepository kanbanColumnRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private ProjectRepository projectRepository;

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
    void getMe_returns200WithUser() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    void getMe_returns401_whenNoToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProfile_returns200WithUpdatedDisplayName() throws Exception {
        mockMvc.perform(patch("/api/auth/profile")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("displayName", "John Doe"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("John Doe"))
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    void updateProfile_returns401_whenNoToken() throws Exception {
        mockMvc.perform(patch("/api/auth/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("displayName", "John Doe"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateProfile_returns400_whenDisplayNameIsBlank() throws Exception {
        mockMvc.perform(patch("/api/auth/profile")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("displayName", ""))))
                .andExpect(status().isBadRequest());
    }
}
