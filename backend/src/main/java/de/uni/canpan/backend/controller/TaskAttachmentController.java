package de.uni.canpan.backend.controller;

import de.uni.canpan.backend.dto.TaskAttachmentDto;
import de.uni.canpan.backend.model.TaskAttachment;
import de.uni.canpan.backend.service.TaskAttachmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost", "http://localhost:4200"}) // Access permission for Angular
public class TaskAttachmentController {

    private final TaskAttachmentService attachmentService;

    public TaskAttachmentController(TaskAttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/{taskId}/attachments")
    public ResponseEntity<TaskAttachmentDto> uploadFile(
            @PathVariable UUID taskId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            TaskAttachment savedAttachment = attachmentService.uploadAttachment(taskId, file);

            return ResponseEntity.ok(TaskAttachmentDto.from(savedAttachment));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable UUID attachmentId) {

        attachmentService.deleteAttachment(attachmentId);

        return ResponseEntity.noContent().build();
    }
}