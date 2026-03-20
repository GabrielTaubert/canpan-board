package de.uni.canpan.backend.model;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectMemberIdTest {

    @Test
    void equals_returnsTrueForSameObject() {
        var id = new ProjectMemberId(UUID.randomUUID(), UUID.randomUUID());
        assertThat(id).isEqualTo(id);
    }

    @Test
    void equals_returnsTrueForEqualIds() {
        UUID projectId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        var id1 = new ProjectMemberId(projectId, userId);
        var id2 = new ProjectMemberId(projectId, userId);
        assertThat(id1).isEqualTo(id2);
    }

    @Test
    void equals_returnsFalseForDifferentProjectId() {
        UUID userId = UUID.randomUUID();
        var id1 = new ProjectMemberId(UUID.randomUUID(), userId);
        var id2 = new ProjectMemberId(UUID.randomUUID(), userId);
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    void equals_returnsFalseForDifferentUserId() {
        UUID projectId = UUID.randomUUID();
        var id1 = new ProjectMemberId(projectId, UUID.randomUUID());
        var id2 = new ProjectMemberId(projectId, UUID.randomUUID());
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    void equals_returnsFalseForNull() {
        var id = new ProjectMemberId(UUID.randomUUID(), UUID.randomUUID());
        assertThat(id).isNotEqualTo(null);
    }

    @Test
    void equals_returnsFalseForDifferentType() {
        var id = new ProjectMemberId(UUID.randomUUID(), UUID.randomUUID());
        assertThat(id).isNotEqualTo("string");
    }

    @Test
    void hashCode_equalForSameIds() {
        UUID projectId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        var id1 = new ProjectMemberId(projectId, userId);
        var id2 = new ProjectMemberId(projectId, userId);
        assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
    }

    @Test
    void gettersAndSetters_work() {
        var id = new ProjectMemberId();
        UUID projectId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        id.setProjectId(projectId);
        id.setUserId(userId);
        assertThat(id.getProjectId()).isEqualTo(projectId);
        assertThat(id.getUserId()).isEqualTo(userId);
    }
}
