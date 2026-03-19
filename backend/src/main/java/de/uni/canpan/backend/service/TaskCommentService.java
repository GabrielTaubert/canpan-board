package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.TaskCommentDto;
import de.uni.canpan.backend.dto.TaskCommentRequest;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.TaskComment;
import de.uni.canpan.backend.repository.TaskCommentRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;

    public TaskCommentService(TaskCommentRepository commentRepository, TaskRepository taskRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public TaskComment addComment(UUID taskId, TaskCommentRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        TaskComment comment = new TaskComment(task, request.userId(), request.content());
        TaskComment savedComment = commentRepository.save(comment);

        return savedComment;
    }
}