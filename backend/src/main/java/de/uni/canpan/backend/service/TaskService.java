package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.*;
import de.uni.canpan.backend.model.*;
import de.uni.canpan.backend.repository.*;
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
    private final TaskLabelRepository taskLabelRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TaskService(TaskRepository taskRepository,
                       TaskAttachmentRepository taskAttachmentRepository,
                       KanbanColumnRepository columnRepository,
                       TaskCommentRepository taskCommentRepository,
                       TaskLabelRepository taskLabelRepository,
                       UserRepository userRepository,
                       NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.taskAttachmentRepository = taskAttachmentRepository;
        this.columnRepository = columnRepository;
        this.taskCommentRepository = taskCommentRepository;
        this.taskLabelRepository = taskLabelRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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

        User assignedUser = null;
        if (request.assignedTo() != null) {
            assignedUser = userRepository.findById(request.assignedTo())
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + request.assignedTo()));
        }

        Task newTask = new Task(
                column,
                request.title(),
                request.description(),
                request.priority(),
                request.storypoints(),
                assignedUser
        );

        Task savedTask = taskRepository.save(newTask);

        if (assignedUser != null) {
            notificationService.sendNotification(assignedUser,
                    "New task assigned: '" + savedTask.getTitle() + "'");
        }

        return savedTask;
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
        Task savedTask = taskRepository.save(task);

        if (savedTask.getAssignedTo() != null) {
            notificationService.sendNotification(
                    savedTask.getAssignedTo(),
                    "Status update: Your task '" + savedTask.getTitle() + "' has been moved to '" + targetColumn.getName() + "'."
            );
        }

        return savedTask;
    }

    @Transactional(readOnly = true)
    public TaskDetailDto getTaskDetail(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        List<TaskAttachment> attachments = taskAttachmentRepository.findByTaskId(taskId);

        List<TaskComment> comments = taskCommentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);

        TaskLabelDto labelDto = taskLabelRepository.findByTaskId(taskId)
                .map(TaskLabelDto::from)
                .orElse(null);

        UUID assignedUserId = (task.getAssignedTo() != null) ? task.getAssignedTo().getId() : null;

        return new TaskDetailDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getColumn().getId(),
                task.getColumn().getName(),
                task.getPriority(),
                task.getStorypoints(),
                assignedUserId,
                task.getCreatedAt(),
                task.getUpdatedAt(),
                labelDto,
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

        User oldUser = task.getAssignedTo();

        User newUser = null;
        if (request.assignedTo() != null) {
            newUser = userRepository.findById(request.assignedTo())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setColumn(column);
        task.setPriority(request.priority());
        task.setStorypoints(request.storypoints());
        task.setAssignedTo(newUser);

        if (newUser != null) {
            boolean wasNullBefore = (oldUser == null);
            boolean isDifferentUser = !wasNullBefore && !oldUser.getId().equals(newUser.getId());

            if (wasNullBefore || isDifferentUser) {
                notificationService.sendNotification(newUser,
                        "Assignment: The task '" + task.getTitle() + "' has been assigned to you.");
            }
        }

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
