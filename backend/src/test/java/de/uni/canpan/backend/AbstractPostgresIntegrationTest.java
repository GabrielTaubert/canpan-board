package de.uni.canpan.backend;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

@ActiveProfiles("test")
public abstract class AbstractPostgresIntegrationTest {

    static final PostgreSQLContainer<?> postgres;

    static {
        // 1. ZUERST: Lade die .env Variablen in die System-Properties
        // Das sorgt dafür, dass Spring ${SUPABASE_URL} etc. in der YAML auflösen kann
        de.uni.canpan.backend.config.EnvLoader.load();

        // 2. Testcontainer konfigurieren
        postgres = new PostgreSQLContainer<>("postgres:16")
                .withDatabaseName("testdb")
                .withUsername("test")
                .withPassword("test");
        postgres.start();
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // 3. WICHTIG: Die Werte vom Testcontainer überschreiben die Werte aus der .env/YAML
        // So stellen wir sicher, dass die Tests NICHT deine echte lokale DB nutzen
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);

        // Sicherstellen, dass PostgreSQL Dialekt genutzt wird, auch wenn
        // die application.properties deines Kollegen H2 sagt
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }
}