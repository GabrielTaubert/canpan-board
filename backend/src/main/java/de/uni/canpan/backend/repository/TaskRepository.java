package de.uni.canpan.backend.repository;

import de.uni.canpan.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByColumnId(UUID columnId);

    List<Task> findByAssignedTo(UUID assignedTo);

    List<Task> findByColumnProjectId(UUID projectId);

    List<Task> findByPriority(Task.TaskPriority priority);

    @Query("SELECT t FROM Task t WHERE t.column.id = :columnId AND t.archived = false")
    List<Task> findActiveByColumnId(@Param("columnId") UUID columnId);

    @Query("SELECT t FROM Task t WHERE t.column.project.id = :projectId AND t.archived = false")
    List<Task> findActiveByProjectId(@Param("projectId") UUID projectId);

    @Query("""
        SELECT t FROM Task t 
        WHERE t.column.isSystem = true 
        AND t.column.position > 0 
        AND t.archived = false 
        AND COALESCE(t.updatedAt, t.createdAt) < :threshold
    """)
    List<Task> findTasksToArchive(@Param("threshold") OffsetDateTime threshold);

    @Query("""
        SELECT t FROM Task t 
        WHERE t.column.project.id = :projectId 
        AND (
            LOWER(t.title) LIKE LOWER(CONCAT('%', :text, '%')) 
            OR LOWER(t.description) LIKE LOWER(CONCAT('%', :text, '%'))
        )
    """)
    List<Task> searchTasksInProject(@Param("projectId") UUID projectId, @Param("text") String text);

    @Query("""
    SELECT t.assignedTo, SUM(t.storypoints), COUNT(t)
    FROM Task t
    WHERE t.column.project.id = :projectId
    AND t.archived = false
    AND NOT (t.column.isSystem = true AND t.column.position > 0)
    GROUP BY t.assignedTo
""")
    List<Object[]> getUserStoryPointRawStats(@Param("projectId") UUID projectId);
}
