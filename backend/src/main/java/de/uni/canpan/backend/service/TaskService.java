package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.TaskAttachmentDto;
import de.uni.canpan.backend.dto.TaskDetailDto;
import de.uni.canpan.backend.model.KanbanColumn;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.TaskAttachment;
import de.uni.canpan.backend.repository.KanbanColumnRepository;
import de.uni.canpan.backend.repository.TaskAttachmentRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAttachmentRepository taskAttachmentRepository;
    private final KanbanColumnRepository columnRepository;

    public TaskService(TaskRepository taskRepository,
                       TaskAttachmentRepository taskAttachmentRepository,
                       KanbanColumnRepository columnRepository) {
        this.taskRepository = taskRepository;
        this.taskAttachmentRepository = taskAttachmentRepository;
        this.columnRepository = columnRepository;
    }

    @Transactional
    public List<Task> getColumnTasks(UUID columnId) {
        return taskRepository.findByColumnId(columnId);
    }

    @Transactional
    public List<Task> getProjectTasks(UUID projectId) {
        return taskRepository.findByColumnProjectId(projectId);
    }

    @Transactional
    public Task createTask(UUID columnId,
                           String title,
                           String description,
                           Task.TaskPriority priority,
                           Integer storypoints,
                           UUID assignedTo){
        KanbanColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        Task newTask = new Task(column, title, description, priority, storypoints, assignedTo);

        return taskRepository.save(newTask);
    }

    @Transactional
    public Task moveTask(UUID taskId, UUID columnId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        KanbanColumn targetColumn = columnRepository.findById(columnId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        if (task.getColumn().getId().equals(columnId)) {
            return task;
        }

        task.setColumn(targetColumn);

        return task;
    }

    @Transactional
    public TaskDetailDto getTaskDetail(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        List<TaskAttachment> attachments = taskAttachmentRepository.findByTaskId(taskId);

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
                        .toList()
        );
    }

    @Transactional
    public Task editTask(UUID taskId,
                         String title,
                         String description,
                         UUID columnId,
                         Task.TaskPriority priority,
                         Integer storypoints,
                         UUID assignedTo){
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        KanbanColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new IllegalArgumentException("Column not found"));

        task.setTitle(title);
        task.setDescription(description);
        task.setColumn(column);
        task.setPriority(priority);
        task.setStorypoints(storypoints);
        task.setAssignedTo(assignedTo);

        return task;
    }

    @Transactional
    public void deleteTask(UUID taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        taskRepository.delete(task);

    }

}
