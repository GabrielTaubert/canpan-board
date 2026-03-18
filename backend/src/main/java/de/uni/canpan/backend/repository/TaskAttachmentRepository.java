package de.uni.canpan.backend.repository;

import de.uni.canpan.backend.model.TaskAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, UUID> {
    List<TaskAttachment> findByTaskId(UUID taskId);
}
