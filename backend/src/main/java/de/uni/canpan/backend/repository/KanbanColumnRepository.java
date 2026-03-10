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

    @Modifying
    @Query("""
        update KanbanColumn c
        set c.position = c.position + 1
        where c.project.id = :projectId
          and c.position >= :fromPosition
    """)
    int incrementPositionsFrom(@Param("projectId") UUID projectId,
                               @Param("fromPosition") int fromPosition);

    @Modifying
    @Query("""
        update KanbanColumn c
        set c.position = c.position + 1
        where c.project.id = :projectId
          and c.position >= :fromPosition
          and c.position < :toPosition
    """)
    int incrementPositionsInRange(@Param("projectId") UUID projectId,
                                  @Param("fromPosition") int fromPosition,
                                  @Param("toPosition") int toPosition);

    @Modifying
    @Query("""
        update KanbanColumn c
        set c.position = c.position - 1
        where c.project.id = :projectId
          and c.position > :fromPosition
          and c.position <= :toPosition
    """)
    int decrementPositionsInRange(@Param("projectId") UUID projectId,
                                  @Param("fromPosition") int fromPosition,
                                  @Param("toPosition") int toPosition);

    @Modifying
    @Query("""
        update KanbanColumn c
        set c.position = c.position - 1
        where c.project.id = :projectId
          and c.position > :removedPosition
    """)
    int decrementPositionsAfter(@Param("projectId") UUID projectId,
                                @Param("removedPosition") int removedPosition);

}

