package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.*;
import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController (TaskService taskService) {this.taskService = taskService;}

    @GetMapping("/column/{columnId}")
    public List<TaskSummaryDto> getColumnTasks(@PathVariable UUID columnId) {
        return taskService.getColumnTasks(columnId)
                .stream()
                .map(TaskSummaryDto::from)
                .toList();
    }

    @GetMapping("/project/{projectId}")
    public List<TaskSummaryDto> getProjectTasks(@PathVariable UUID projectId) {
        return taskService.getProjectTasks(projectId)
                .stream()
                .map(TaskSummaryDto::from)
                .toList();
    }

    @GetMapping("/project/{projectId}/search")
    public List<TaskSummaryDto> searchProjectTasks(
            @PathVariable("projectId") UUID projectId,
            @RequestParam(value = "query", required = false) String searchText
    ) {
        return taskService.searchTasksInProject(projectId, searchText)
                .stream()
                .map(TaskSummaryDto::from)
                .toList();
    }

    @GetMapping("/{taskId}")
    public TaskDetailDto getTaskDetail(@PathVariable UUID taskId) {
        return taskService.getTaskDetail(taskId);
    }

    @PostMapping("/column/{columnId}")
    public TaskDto createTask(
            @PathVariable UUID columnId,
            @RequestBody TaskRequest request
    ) {

        Task task = taskService.createTask(columnId, request);
        return TaskDto.from(task);
    }

    @PutMapping("/{taskId}")
    public TaskDto editTask(
            @PathVariable UUID taskId,
            @RequestBody TaskRequest request
    ) {
        Task updatedTask = taskService.editTask(taskId, request);
        return TaskDto.from(updatedTask);
    }

    @PutMapping("/{taskId}/move")
    public TaskDto moveTask(
            @PathVariable UUID taskId,
            @RequestBody MoveTaskRequest request
    ) {
        Task movedTask = taskService.moveTask(taskId, request);
        return TaskDto.from(movedTask);
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(
            @PathVariable UUID taskId
    ) {
        taskService.deleteTask(taskId);
    }
}
