package de.uni.canpan.backend.repository;

import de.uni.canpan.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByProjectMembersUserId(UUID userId);
}
