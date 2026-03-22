package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.TaskAttachmentUrlRequest;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.TaskAttachment;
import de.uni.canpan.backend.repository.TaskAttachmentRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TaskAttachmentService {

    private final TaskRepository taskRepository;
    private final TaskAttachmentRepository taskAttachmentRepository;

    public TaskAttachmentService(TaskRepository taskRepository,
                                 TaskAttachmentRepository taskAttachmentRepository) {
        this.taskRepository = taskRepository;
        this.taskAttachmentRepository = taskAttachmentRepository;
    }

    @Transactional
    public TaskAttachment saveAttachmentUrl(UUID taskId, TaskAttachmentUrlRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        TaskAttachment attachment = new TaskAttachment(
                task,
                request.fileName(),
                request.fileUrl()
        );

        return taskAttachmentRepository.save(attachment);
    }

    @Transactional
    public void deleteAttachment(UUID attachmentId) {

        TaskAttachment attachment = taskAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        taskAttachmentRepository.delete(attachment);
    }

}