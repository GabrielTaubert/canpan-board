package de.uni.canpan.backend.security;

import de.uni.canpan.backend.config.SupabaseProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String TEST_JWT_SECRET = "test-secret-key-that-is-at-least-32-characters-long";
    private JwtService jwtService;
    private SupabaseProperties supabaseProperties;

    @BeforeEach
    void setUp() {
        supabaseProperties = new SupabaseProperties();
        supabaseProperties.setJwtSecret(TEST_JWT_SECRET);
        jwtService = new JwtService(supabaseProperties);
    }

    @Test
    void validateToken_withValidToken_returnsClaims() {
        String token = createValidToken();

        Optional<io.jsonwebtoken.Claims> result = jwtService.validateToken(token);

        assertTrue(result.isPresent());
        assertEquals("test-user-id", result.get().getSubject());
    }

    @Test
    void validateToken_withInvalidToken_returnsEmpty() {
        String token = "invalid.token.here";

        Optional<io.jsonwebtoken.Claims> result = jwtService.validateToken(token);

        assertTrue(result.isEmpty());
    }

    @Test
    void validateToken_withExpiredToken_returnsEmpty() {
        String token = createExpiredToken();

        Optional<io.jsonwebtoken.Claims> result = jwtService.validateToken(token);

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserId_returnsSubject() {
        String token = createValidToken();
        io.jsonwebtoken.Claims claims = jwtService.validateToken(token).get();

        String userId = jwtService.getUserId(claims);

        assertEquals("test-user-id", userId);
    }

    @Test
    void getEmail_returnsEmailFromClaims() {
        String token = createValidTokenWithEmail();
        io.jsonwebtoken.Claims claims = jwtService.validateToken(token).get();

        String email = jwtService.getEmail(claims);

        assertEquals("test@example.com", email);
    }

    @Test
    void extractUserIdFromToken_returnsUserId() {
        String token = createValidToken();

        Optional<String> userId = jwtService.extractUserIdFromToken(token);

        assertTrue(userId.isPresent());
        assertEquals("test-user-id", userId.get());
    }

    @Test
    void extractEmailFromToken_returnsEmail() {
        String token = createValidTokenWithEmail();

        Optional<String> email = jwtService.extractEmailFromToken(token);

        assertTrue(email.isPresent());
        assertEquals("test@example.com", email.get());
    }

    @Test
    void isTokenExpired_withValidToken_returnsFalse() {
        String token = createValidToken();
        io.jsonwebtoken.Claims claims = jwtService.validateToken(token).get();

        boolean result = jwtService.isTokenExpired(claims);

        assertFalse(result);
    }

    @Test
    void isTokenExpired_withNullClaims_returnsTrue() {
        assertThrows(NullPointerException.class, () -> jwtService.isTokenExpired(null));
    }

    private String createValidToken() {
        SecretKey key = Keys.hmacShaKeyFor(TEST_JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject("test-user-id")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    private String createValidTokenWithEmail() {
        SecretKey key = Keys.hmacShaKeyFor(TEST_JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject("test-user-id")
                .claim("email", "test@example.com")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();
    }

    private String createExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(TEST_JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject("test-user-id")
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(key)
                .compact();
    }
}
