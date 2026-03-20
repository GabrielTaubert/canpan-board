package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.TaskLabelDto;
import de.uni.canpan.backend.dto.TaskLabelRequest;
import de.uni.canpan.backend.model.TaskLabel;
import de.uni.canpan.backend.service.TaskLabelService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/{taskId}/label")
public class TaskLabelController {
    private final TaskLabelService taskLabelService;

    public TaskLabelController(TaskLabelService taskLabelService) {
        this.taskLabelService = taskLabelService;
    }

    @PutMapping
    public TaskLabelDto setLabel(@PathVariable UUID taskId, @RequestBody TaskLabelRequest request) {

        TaskLabel label = taskLabelService.setLabel(taskId, request);

        return TaskLabelDto.from(label);
    }

    @DeleteMapping
    public void deleteLabel(@PathVariable UUID taskId) {
        taskLabelService.deleteLabel(taskId);
    }
}
