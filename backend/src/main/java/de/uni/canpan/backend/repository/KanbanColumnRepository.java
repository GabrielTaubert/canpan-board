package de.uni.canpan.backend.repository;

import de.uni.canpan.backend.model.KanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, UUID> {
    List<KanbanColumn> findByProjectIdOrderByPosition(UUID projectId);

    Optional<KanbanColumn> findById(UUID id);

    Optional<KanbanColumn> findByIdAndProjectId(UUID id, UUID projectId);

    Optional<KanbanColumn> findByName(String name);
}

