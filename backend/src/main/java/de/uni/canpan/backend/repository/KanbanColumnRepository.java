package de.uni.canpan.backend.repository;

import de.uni.canpan.backend.model.KanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, UUID> {
    List<KanbanColumn> findByProjectIdOrderByPosition(UUID projectId);

    Optional<KanbanColumn> findByIdAndProjectId(UUID id, UUID projectId);
}

