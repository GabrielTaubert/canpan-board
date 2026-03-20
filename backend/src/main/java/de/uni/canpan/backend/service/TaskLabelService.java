package de.uni.canpan.backend.service;

import de.uni.canpan.backend.dto.*;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.TaskLabel;
import de.uni.canpan.backend.repository.TaskRepository;
import de.uni.canpan.backend.repository.TaskLabelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TaskLabelService {
    private final TaskLabelRepository taskLabelRepository;
    private final TaskRepository taskRepository;

    public TaskLabelService(TaskLabelRepository taskLabelRepository, TaskRepository taskRepository) {
        this.taskLabelRepository = taskLabelRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public TaskLabel setLabel(UUID taskId, TaskLabelRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        // if label already exist -> update else create new
        TaskLabel label = taskLabelRepository.findByTaskId(taskId)
                .orElse(new TaskLabel(task, request.labelText(), request.color()));

        label.setLabelText(request.labelText());
        label.setColor(request.color());

        return taskLabelRepository.save(label);
    }

    @Transactional
    public void deleteLabel(UUID taskId) {

        TaskLabel label = taskLabelRepository.findByTaskId(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Label not found"));

        taskLabelRepository.delete(label);
    }
}
