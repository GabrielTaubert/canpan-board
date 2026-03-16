package de.uni.canpan.backend.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.uni.canpan.backend.config.SupabaseProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigInteger;
import java.security.*;
import java.security.spec.*;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    private volatile PublicKey publicKey;
    private final String supabaseUrl;
    private final RestTemplate restTemplate;

    public JwtService(SupabaseProperties supabaseProperties, RestTemplate restTemplate) {
        this.supabaseUrl = supabaseProperties.getUrl();
        this.restTemplate = restTemplate;
    }

    private PublicKey getPublicKey() {
        if (publicKey == null) {
            synchronized (this) {
                if (publicKey == null) {
                    publicKey = loadPublicKeyFromJwks(supabaseUrl, restTemplate);
                }
            }
        }
        return publicKey;
    }

    private PublicKey loadPublicKeyFromJwks(String supabaseUrl, RestTemplate restTemplate) {
        try {
            String jwksUrl = supabaseUrl + "/auth/v1/.well-known/jwks.json";
            String jwksJson = restTemplate.getForObject(jwksUrl, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode key = mapper.readTree(jwksJson).get("keys").get(0);
            String alg = key.get("alg").asText();

            if ("ES256".equals(alg)) {
                byte[] xBytes = Base64.getUrlDecoder().decode(key.get("x").asText());
                byte[] yBytes = Base64.getUrlDecoder().decode(key.get("y").asText());

                ECPoint point = new ECPoint(new BigInteger(1, xBytes), new BigInteger(1, yBytes));
                AlgorithmParameters params = AlgorithmParameters.getInstance("EC");
                params.init(new ECGenParameterSpec("secp256r1"));
                ECParameterSpec ecSpec = params.getParameterSpec(ECParameterSpec.class);

                KeyFactory kf = KeyFactory.getInstance("EC");
                return kf.generatePublic(new ECPublicKeySpec(point, ecSpec));
            }

            throw new IllegalStateException("Unsupported JWKS algorithm: " + alg);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load public key from Supabase JWKS endpoint", e);
        }
    }

    public Optional<Claims> validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getPublicKey())
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
