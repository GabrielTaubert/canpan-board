package de.uni.canpan.backend.service;

import de.uni.canpan.backend.model.Task;
import de.uni.canpan.backend.model.TaskAttachment;
import de.uni.canpan.backend.repository.TaskAttachmentRepository;
import de.uni.canpan.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class TaskAttachmentService {

    private final TaskRepository taskRepository;
    private final TaskAttachmentRepository taskAttachmentRepository;
    private final S3Client s3Client;

    @Value("${supabase.s3.bucket}")
    private String bucketName;

    @Value("${supabase.storage.public-url}")
    private String publicBaseUrl;

    public TaskAttachmentService(TaskRepository taskRepository,
                                 TaskAttachmentRepository taskAttachmentRepository,
                                 S3Client s3Client) {
        this.taskRepository = taskRepository;
        this.taskAttachmentRepository = taskAttachmentRepository;
        this.s3Client = s3Client;
    }

    @Transactional
    public TaskAttachment uploadAttachment(UUID taskId, MultipartFile file) throws IOException {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        // unique file name
        String originalFileName = file.getOriginalFilename();
        String safeFileName = UUID.randomUUID() + "_" + originalFileName.replaceAll("\\s+", "_");

        // file upload to supabase
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(safeFileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest,
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // generate public url and save in DB
        String fileUrl = publicBaseUrl + safeFileName;
        TaskAttachment attachment = new TaskAttachment(task, originalFileName, fileUrl);

        return taskAttachmentRepository.save(attachment);
    }

    @Transactional
    public void deleteAttachment(UUID attachmentId) {

        TaskAttachment attachment = taskAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        taskAttachmentRepository.delete(attachment);
    }

}