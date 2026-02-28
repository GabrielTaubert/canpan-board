package de.uni.canpan.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.uni.canpan.backend.config.SupabaseProperties;
import de.uni.canpan.backend.dto.*;
import de.uni.canpan.backend.exception.AuthException;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.UserRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
public class AuthService {

    private final SupabaseProperties supabaseProperties;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AuthService(SupabaseProperties supabaseProperties,
                       UserRepository userRepository,
                       RestTemplate restTemplate) {
        this.supabaseProperties = supabaseProperties;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public AuthResponse register(RegisterRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseProperties.getServiceRoleKey());

        String url = supabaseProperties.getAuthUrl() + "/signup";

        String body = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\"}",
                request.getEmail(),
                request.getPassword()
        );

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode json = objectMapper.readTree(response.getBody());
                
                if (json.has("user")) {
                    JsonNode user = json.get("user");
                    String userId = user.get("id").asText();
                    String email = user.get("email").asText();

                    saveUserToDatabase(UUID.fromString(userId), email);

                    return new AuthResponse(
                            json.has("access_token") ? json.get("access_token").asText() : null,
                            "bearer",
                            json.has("expires_in") ? json.get("expires_in").asLong() : 3600,
                            json.has("refresh_token") ? json.get("refresh_token").asText() : null,
                            userId,
                            email
                    );
                } else if (json.has("msg")) {
                    throw new AuthException(json.get("msg").asText());
                }
            }

            throw new AuthException("Registration failed");
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("Registration failed: " + e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseProperties.getAnonKey());

        String url = supabaseProperties.getAuthUrl() + "/token?grant_type=password";

        String body = String.format(
                "{\"email\":\"%s\",\"password\":\"%s\"}",
                request.getEmail(),
                request.getPassword()
        );

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode json = objectMapper.readTree(response.getBody());

                String accessToken = json.get("access_token").asText();
                String userId = json.get("user").get("id").asText();
                String email = json.get("user").get("email").asText();

                return new AuthResponse(
                        accessToken,
                        "bearer",
                        json.get("expires_in").asLong(),
                        json.has("refresh_token") ? json.get("refresh_token").asText() : null,
                        userId,
                        email
                );
            }

            throw new AuthException("Login failed");
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("Invalid email or password");
        }
    }

    public UserResponse getCurrentUser(String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new AuthException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    private void saveUserToDatabase(UUID userId, String email) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User(userId, email);
            userRepository.save(user);
        }
    }
}
