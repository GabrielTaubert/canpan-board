package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.TaskCommentRequest;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.TaskComment;
import de.uni.canpan.backend.model.User;
import de.uni.canpan.backend.repository.TaskCommentRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import de.uni.canpan.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskCommentService(TaskCommentRepository commentRepository,
                              TaskRepository taskRepository,
                              UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TaskComment addComment(UUID taskId, TaskCommentRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        User author = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + request.userId()));

        TaskComment comment = new TaskComment(task, author, request.content());

        return commentRepository.save(comment);
    }
}