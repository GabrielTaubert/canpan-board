package de.uni.canpan.backend.repository;

import de.uni.canpan.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByColumnId(UUID columnId);

    List<Task> findByAssignedTo(UUID assignedTo);

    List<Task> findByColumnProjectId(UUID projectId);

    List<Task> findByPriority(Task.TaskPriority priority);
}
