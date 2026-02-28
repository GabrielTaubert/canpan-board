package de.uni.canpan.backend.service;

import de.uni.canpan.backend.config.SupabaseProperties;
import de.uni.canpan.backend.dto.AuthResponse;
import de.uni.canpan.backend.dto.LoginRequest;
import de.uni.canpan.backend.dto.RegisterRequest;
import de.uni.canpan.backend.dto.UserResponse;
import de.uni.canpan.backend.exception.AuthException;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestTemplate restTemplate;

    private AuthService authService;
    private SupabaseProperties supabaseProperties;

    @BeforeEach
    void setUp() {
        supabaseProperties = new SupabaseProperties();
        supabaseProperties.setUrl("http://localhost:54321");
        supabaseProperties.setAnonKey("anon-key");
        supabaseProperties.setServiceRoleKey("service-role-key");

        authService = new AuthService(supabaseProperties, userRepository, restTemplate);
    }

    @Test
    void register_withValidRequest_returnsAuthResponse() throws Exception {
        RegisterRequest request = new RegisterRequest("newuser@example.com", "password123");
        
        String validUuid = UUID.randomUUID().toString();
        String responseBody = String.format(
            "{\"access_token\":\"token123\",\"expires_in\":3600,\"refresh_token\":\"refresh123\",\"user\":{\"id\":\"%s\",\"email\":\"newuser@example.com\"}}",
            validUuid);
        
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(responseBody, HttpStatus.OK));
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(null);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("token123", response.getAccessToken());
        assertEquals("newuser@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_withExistingEmail_doesNotSaveDuplicate() throws Exception {
        RegisterRequest request = new RegisterRequest("existing@example.com", "password123");
        
        String validUuid = UUID.randomUUID().toString();
        String responseBody = String.format(
            "{\"access_token\":\"token123\",\"expires_in\":3600,\"user\":{\"id\":\"%s\",\"email\":\"existing@example.com\"}}",
            validUuid);
        
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(responseBody, HttpStatus.OK));
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        authService.register(request);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_withValidCredentials_returnsAuthResponse() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        
        String validUuid = UUID.randomUUID().toString();
        String responseBody = String.format(
            "{\"access_token\":\"token123\",\"expires_in\":3600,\"refresh_token\":\"refresh123\",\"user\":{\"id\":\"%s\",\"email\":\"test@example.com\"}}",
            validUuid);
        
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(responseBody, HttpStatus.OK));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("token123", response.getAccessToken());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void login_withInvalidCredentials_throwsAuthException() throws Exception {
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");
        
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        assertThrows(AuthException.class, () -> authService.login(request));
    }

    @Test
    void getCurrentUser_withValidUserId_returnsUserResponse() {
        UUID userId = UUID.randomUUID();
        User user = new User(userId, "test@example.com");
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserResponse response = authService.getCurrentUser(userId.toString());

        assertNotNull(response);
        assertEquals(userId, response.getId());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void getCurrentUser_withInvalidUserId_throwsAuthException() {
        UUID userId = UUID.randomUUID();
        
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(AuthException.class, () -> authService.getCurrentUser(userId.toString()));
    }
}
