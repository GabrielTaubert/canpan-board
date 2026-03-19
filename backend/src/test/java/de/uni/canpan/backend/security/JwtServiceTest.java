package de.uni.canpan.backend.security;

import de.uni.canpan.backend.config.SupabaseProperties;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import java.math.BigInteger;
import java.security.*;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    private JwtService jwtService;
    private ECPrivateKey testPrivateKey;

    @BeforeEach
    void setUp() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        kpg.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair keyPair = kpg.generateKeyPair();

        testPrivateKey = (ECPrivateKey) keyPair.getPrivate();
        ECPublicKey ecPublicKey = (ECPublicKey) keyPair.getPublic();

        String x = encodeCoordinate(ecPublicKey.getW().getAffineX());
        String y = encodeCoordinate(ecPublicKey.getW().getAffineY());
        String jwksJson = String.format(
                "{\"keys\":[{\"kty\":\"EC\",\"alg\":\"ES256\",\"crv\":\"P-256\",\"x\":\"%s\",\"y\":\"%s\"}]}",
                x, y);

        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        when(mockRestTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jwksJson);

        SupabaseProperties props = new SupabaseProperties();
        props.setUrl("http://localhost:54321");
        jwtService = new JwtService(props, mockRestTemplate);
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
        Optional<io.jsonwebtoken.Claims> result = jwtService.validateToken("invalid.token.here");

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
        io.jsonwebtoken.Claims claims = jwtService.validateToken(createValidToken()).get();

        assertEquals("test-user-id", jwtService.getUserId(claims));
    }

    @Test
    void getEmail_returnsEmailFromClaims() {
        io.jsonwebtoken.Claims claims = jwtService.validateToken(createValidTokenWithEmail()).get();

        assertEquals("test@example.com", jwtService.getEmail(claims));
    }

    @Test
    void extractUserIdFromToken_returnsUserId() {
        Optional<String> userId = jwtService.extractUserIdFromToken(createValidToken());

        assertTrue(userId.isPresent());
        assertEquals("test-user-id", userId.get());
    }

    @Test
    void extractEmailFromToken_returnsEmail() {
        Optional<String> email = jwtService.extractEmailFromToken(createValidTokenWithEmail());

        assertTrue(email.isPresent());
        assertEquals("test@example.com", email.get());
    }

    @Test
    void isTokenExpired_withValidToken_returnsFalse() {
        io.jsonwebtoken.Claims claims = jwtService.validateToken(createValidToken()).get();

        assertFalse(jwtService.isTokenExpired(claims));
    }

    private String createValidToken() {
        return Jwts.builder()
                .subject("test-user-id")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(testPrivateKey)
                .compact();
    }

    private String createValidTokenWithEmail() {
        return Jwts.builder()
                .subject("test-user-id")
                .claim("email", "test@example.com")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(testPrivateKey)
                .compact();
    }

    private String createExpiredToken() {
        return Jwts.builder()
                .subject("test-user-id")
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(testPrivateKey)
                .compact();
    }

    private String encodeCoordinate(BigInteger value) {
        byte[] bytes = value.toByteArray();
        // Strip leading zero byte (sign byte added by toByteArray for positive numbers)
        if (bytes.length == 33 && bytes[0] == 0) {
            byte[] trimmed = new byte[32];
            System.arraycopy(bytes, 1, trimmed, 0, 32);
            bytes = trimmed;
        }
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
