package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.TaskCommentDto;
import de.uni.canpan.backend.dto.TaskCommentRequest;
import de.uni.canpan.backend.model.TaskComment;
import de.uni.canpan.backend.service.TaskCommentService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskCommentController {

    private final TaskCommentService taskCommentService;

    public TaskCommentController(TaskCommentService taskCommentService) {this.taskCommentService = taskCommentService;}

    @PostMapping("/{taskId}/comments")
    public TaskCommentDto addComment(
            @PathVariable UUID taskId,
            @RequestBody TaskCommentRequest request
    ) {

        TaskComment comment = taskCommentService.addComment(taskId, request);
        return TaskCommentDto.from(comment);
    }

}
