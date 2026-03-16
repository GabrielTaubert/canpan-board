package de.uni.canpan.backend.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SupabasePropertiesTest {

    @Test
    void settersAndGetters_workCorrectly() {
        SupabaseProperties properties = new SupabaseProperties();

        properties.setUrl("http://localhost:54321");
        properties.setAnonKey("anon-key");
        properties.setServiceRoleKey("service-role-key");
        properties.setJwtSecret("jwt-secret");

        assertEquals("http://localhost:54321", properties.getUrl());
        assertEquals("anon-key", properties.getAnonKey());
        assertEquals("service-role-key", properties.getServiceRoleKey());
        assertEquals("jwt-secret", properties.getJwtSecret());
    }

    @Test
    void getAuthUrl_returnsCorrectUrl() {
        SupabaseProperties properties = new SupabaseProperties();
        properties.setUrl("http://localhost:54321");

        assertEquals("http://localhost:54321/auth/v1", properties.getAuthUrl());
    }

    @Test
    void getApiUrl_returnsCorrectUrl() {
        SupabaseProperties properties = new SupabaseProperties();
        properties.setUrl("http://localhost:54321");

        assertEquals("http://localhost:54321/auth/v1", properties.getApiUrl());
    }
}
