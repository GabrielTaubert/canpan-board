package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.*;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.TaskAttachment;
import de.uni.canpan.backend.model.TaskComment;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.TaskAttachmentRepository;
import de.uni.canpan.backend.repository.TaskCommentRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAttachmentRepository taskAttachmentRepository;
    private final KanbanColumnRepository columnRepository;
    private final TaskCommentRepository taskCommentRepository;

    public TaskService(TaskRepository taskRepository,
                       TaskAttachmentRepository taskAttachmentRepository,
                       KanbanColumnRepository columnRepository,
                       TaskCommentRepository taskCommentRepository) {
        this.taskRepository = taskRepository;
        this.taskAttachmentRepository = taskAttachmentRepository;
        this.columnRepository = columnRepository;
        this.taskCommentRepository = taskCommentRepository;
    }

    @Transactional(readOnly = true)
    public List<Task> getColumnTasks(UUID columnId) {
        return taskRepository.findActiveByColumnId(columnId);
    }

    @Transactional(readOnly = true)
    public List<Task> getProjectTasks(UUID projectId) {
        return taskRepository.findActiveByProjectId(projectId);
    }

    @Transactional
    public Task createTask(UUID columnId, TaskRequest request) {
        KanbanColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found with ID: " + columnId));

        Task newTask = new Task(
                column,
                request.title(),
                request.description(),
                request.priority(),
                request.storypoints(),
                request.assignedTo()
        );

        return taskRepository.save(newTask);
    }

    @Transactional
    public Task moveTask(UUID taskId, MoveTaskRequest request) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (task.getColumn().getId().equals(request.columnId())) {
            return task;
        }

        KanbanColumn targetColumn = columnRepository.findById(request.columnId())
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        task.setColumn(targetColumn);

        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public TaskDetailDto getTaskDetail(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        List<TaskAttachment> attachments = taskAttachmentRepository.findByTaskId(taskId);

        List<TaskComment> comments = taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);

        return new TaskDetailDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getColumn().getId(),
                task.getColumn().getName(),
                task.getPriority(),
                task.getStorypoints(),
                task.getAssignedTo(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                attachments.stream()
                        .map(TaskAttachmentDto::from)
                        .toList(),
                comments.stream()
                        .map(TaskCommentDto::from)
                        .toList()
        );
    }

    @Transactional
    public Task editTask(UUID taskId, TaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        KanbanColumn column = columnRepository.findById(request.columnId())
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setColumn(column);
        task.setPriority(request.priority());
        task.setStorypoints(request.storypoints());
        task.setAssignedTo(request.assignedTo());

        return task;
    }

    @Transactional
    public void deleteTask(UUID taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        taskRepository.delete(task);

    }

    @Transactional(readOnly = true)
    public List<Task> searchTasksInProject(UUID projectId, String searchText) {

        if (searchText == null || searchText.trim().isEmpty()) {
            // Wenn kein Suchtext da ist, einfach alle (aktiven) Projekt-Tasks zurückgeben
            return getProjectTasks(projectId);
        }
        return taskRepository.searchTasksInProject(projectId, searchText.trim());

    }

}
