package de.uni.canpan.backend.repository;

import de.uni.canpan.backend.model.TaskLabel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;


public interface TaskLabelRepository extends JpaRepository<TaskLabel, UUID> {
    Optional<TaskLabel> findByTaskId(UUID taskId);
}
