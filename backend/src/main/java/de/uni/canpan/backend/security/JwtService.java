package de.uni.canpan.backend.security;

import de.uni.canpan.backend.config.SupabaseProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final SupabaseProperties supabaseProperties;

    public JwtService(SupabaseProperties supabaseProperties) {
        this.supabaseProperties = supabaseProperties;
        this.secretKey = Keys.hmacShaKeyFor(
                supabaseProperties.getJwtSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public Optional<Claims> validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public String getUserId(Claims claims) {
        return claims.getSubject();
    }

    public String getEmail(Claims claims) {
        return claims.get("email", String.class);
    }

    public boolean isTokenExpired(Claims claims) {
        Date expiration = claims.getExpiration();
        return expiration != null && expiration.before(new Date());
    }

    public Optional<String> extractUserIdFromToken(String token) {
        return validateToken(token).map(this::getUserId);
    }

    public Optional<String> extractEmailFromToken(String token) {
        return validateToken(token).map(this::getEmail);
    }
}
