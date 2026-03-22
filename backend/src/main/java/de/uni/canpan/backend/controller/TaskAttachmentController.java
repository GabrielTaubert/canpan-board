package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.TaskAttachmentDto;
import de.uni.canpan.backend.dto.TaskAttachmentUrlRequest;
import de.uni.canpan.backend.model.TaskAttachment;
import de.uni.canpan.backend.service.TaskAttachmentService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost", "http://localhost:4200"}) // Access permission for Angular
public class TaskAttachmentController {

    private final TaskAttachmentService attachmentService;

    public TaskAttachmentController(TaskAttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/{taskId}/attachments/url")
    public TaskAttachmentDto addAttachmentUrl(
            @PathVariable UUID taskId,
            @RequestBody TaskAttachmentUrlRequest request
    ) {
        TaskAttachment savedAttachment = attachmentService.saveAttachmentUrl(taskId, request);
        return TaskAttachmentDto.from(savedAttachment);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public void deleteAttachment(@PathVariable UUID attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
    }
}